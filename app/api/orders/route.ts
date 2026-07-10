import type { NextRequest } from "next/server";
import {
  getCurrentOrderById,
  getCurrentOrderForTable,
} from "@/lib/current-order";
import { prisma } from "@/lib/prisma";
import { MAX_TABLE_ID, MIN_TABLE_ID, parseTableIdParam } from "@/lib/table";

export const runtime = "nodejs";

type CreateOrderBody = {
  tableId?: unknown;
  items?: unknown;
};

type CompleteOrderBody = {
  tableId?: unknown;
};

type OrderMenuItem = {
  id: number;
  price: number;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toPositiveInteger(value: unknown) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

export async function GET(request: NextRequest) {
  const tableId = parseTableIdParam(
    request.nextUrl.searchParams.get("tableId") ?? undefined,
  );

  if (!tableId) {
    return jsonError("Bàn không hợp lệ.", 400);
  }

  try {
    const table = await prisma.table.findUnique({
      where: {
        id: tableId,
      },
      select: {
        id: true,
      },
    });

    if (!table) {
      return jsonError("Không tìm thấy bàn.", 404);
    }

    const order = await getCurrentOrderForTable(tableId);

    return Response.json({ order });
  } catch (error) {
    console.error(error);
    return jsonError("Không thể tải order hiện tại.", 500);
  }
}

export async function PATCH(request: Request) {
  let body: CompleteOrderBody;

  try {
    body = (await request.json()) as CompleteOrderBody;
  } catch {
    return jsonError("Payload không hợp lệ.", 400);
  }

  const tableId = toPositiveInteger(body.tableId);

  if (
    tableId === null ||
    tableId < MIN_TABLE_ID ||
    tableId > MAX_TABLE_ID
  ) {
    return jsonError("Bàn không hợp lệ.", 400);
  }

  try {
    const [table, activeOrder] = await Promise.all([
      prisma.table.findUnique({
        where: {
          id: tableId,
        },
        select: {
          id: true,
        },
      }),
      prisma.order.findFirst({
        where: {
          tableId,
          status: "PENDING",
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!table) {
      return jsonError("Không tìm thấy bàn.", 404);
    }

    if (!activeOrder) {
      return Response.json({
        completedOrderId: null,
        order: null,
      });
    }

    await prisma.order.update({
      where: {
        id: activeOrder.id,
      },
      data: {
        status: "COMPLETED",
      },
    });

    return Response.json({
      completedOrderId: activeOrder.id,
      order: null,
    });
  } catch (error) {
    console.error(error);
    return jsonError("Không thể kết thúc bữa ăn. Vui lòng thử lại.", 500);
  }
}

export async function POST(request: Request) {
  let body: CreateOrderBody;

  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    return jsonError("Payload không hợp lệ.", 400);
  }

  const tableId = toPositiveInteger(body.tableId);

  if (
    tableId === null ||
    tableId < MIN_TABLE_ID ||
    tableId > MAX_TABLE_ID
  ) {
    return jsonError("Bàn không hợp lệ.", 400);
  }

  if (!Array.isArray(body.items)) {
    return jsonError("Danh sách món không hợp lệ.", 400);
  }

  const quantitiesByMenuItemId = new Map<number, number>();

  for (const rawItem of body.items) {
    if (!isRecord(rawItem)) {
      return jsonError("Món trong order không hợp lệ.", 400);
    }

    const menuItemId = toPositiveInteger(rawItem.menuItemId);
    const quantity = toPositiveInteger(rawItem.quantity);

    if (menuItemId === null || quantity === null) {
      return jsonError("Món trong order không hợp lệ.", 400);
    }

    quantitiesByMenuItemId.set(
      menuItemId,
      (quantitiesByMenuItemId.get(menuItemId) ?? 0) + quantity,
    );
  }

  if (quantitiesByMenuItemId.size === 0) {
    return jsonError("Order đang trống.", 400);
  }

  const menuItemIds = Array.from(quantitiesByMenuItemId.keys());

  try {
    const [table, menuItems] = await Promise.all([
      prisma.table.findUnique({ where: { id: tableId } }),
      prisma.menuItem.findMany({
        where: {
          id: { in: menuItemIds },
          isAvailable: true,
        },
        select: {
          id: true,
          price: true,
        },
      }),
    ]);

    if (!table) {
      return jsonError("Không tìm thấy bàn.", 404);
    }

    if (menuItems.length !== menuItemIds.length) {
      return jsonError("Một hoặc nhiều món không còn khả dụng.", 400);
    }

    const orderMenuItems = menuItems as OrderMenuItem[];
    const menuItemsById = new Map<number, OrderMenuItem>(
      orderMenuItems.map((item) => [item.id, item]),
    );

    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findFirst({
        where: {
          tableId,
          status: "PENDING",
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          status: true,
        },
      });
      const activeOrder =
        existingOrder ??
        (await tx.order.create({
          data: {
            tableId,
            status: "PENDING",
          },
          select: {
            id: true,
            status: true,
          },
        }));

      for (const menuItemId of menuItemIds) {
        const menuItem = menuItemsById.get(menuItemId);

        if (!menuItem) {
          throw new Error(`Missing menu item ${menuItemId}`);
        }

        const quantity = quantitiesByMenuItemId.get(menuItemId) ?? 1;
        const existingOrderItem = await tx.orderItem.findFirst({
          where: {
            orderId: activeOrder.id,
            menuItemId,
          },
          select: {
            id: true,
            quantity: true,
          },
        });

        if (existingOrderItem) {
          await tx.orderItem.update({
            where: {
              id: existingOrderItem.id,
            },
            data: {
              quantity: existingOrderItem.quantity + quantity,
            },
          });
          continue;
        }

        await tx.orderItem.create({
          data: {
            orderId: activeOrder.id,
            menuItemId,
            quantity,
            unitPrice: menuItem.price,
          },
        });
      }

      return activeOrder;
    });
    const currentOrder = await getCurrentOrderById(order.id);

    return Response.json({
      orderId: order.id,
      status: order.status,
      order: currentOrder,
    });
  } catch (error) {
    console.error(error);
    return jsonError("Không thể tạo order. Vui lòng thử lại.", 500);
  }
}

import { prisma } from "@/lib/prisma";
import { MAX_TABLE_ID, MIN_TABLE_ID } from "@/lib/table";

export const runtime = "nodejs";

type CreateOrderBody = {
  tableId?: unknown;
  items?: unknown;
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
      }),
    ]);

    if (!table) {
      return jsonError("Không tìm thấy bàn.", 404);
    }

    if (menuItems.length !== menuItemIds.length) {
      return jsonError("Một hoặc nhiều món không còn khả dụng.", 400);
    }

    const menuItemsById = new Map(menuItems.map((item) => [item.id, item]));

    const order = await prisma.order.create({
      data: {
        tableId,
        status: "PENDING",
        items: {
          create: menuItemIds.map((menuItemId) => {
            const menuItem = menuItemsById.get(menuItemId);

            if (!menuItem) {
              throw new Error(`Missing menu item ${menuItemId}`);
            }

            return {
              menuItemId,
              quantity: quantitiesByMenuItemId.get(menuItemId) ?? 1,
              unitPrice: menuItem.price,
            };
          }),
        },
      },
    });

    return Response.json({
      orderId: order.id,
      status: order.status,
    });
  } catch (error) {
    console.error(error);
    return jsonError("Không thể tạo order. Vui lòng thử lại.", 500);
  }
}

import { prisma } from "@/lib/prisma";
import type { CurrentOrderDTO, CurrentOrderItemDTO } from "@/lib/order-types";

const currentOrderSelect = {
  id: true,
  tableId: true,
  createdAt: true,
  items: {
    orderBy: {
      id: "asc",
    },
    select: {
      quantity: true,
      unitPrice: true,
      menuItem: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  },
} as const;

type CurrentOrderRecord = {
  id: number;
  tableId: number;
  createdAt: Date;
  items: Array<{
    quantity: number;
    unitPrice: number;
    menuItem: {
      id: number;
      name: string;
      imageUrl: string | null;
    };
  }>;
};

function toCurrentOrderDTO(
  order: CurrentOrderRecord | null,
): CurrentOrderDTO | null {
  if (!order) {
    return null;
  }

  const itemsByMenuItemId = new Map<number, CurrentOrderItemDTO>();

  for (const item of order.items) {
    const menuItemId = item.menuItem.id;
    const lineTotal = item.unitPrice * item.quantity;
    const existingItem = itemsByMenuItemId.get(menuItemId);

    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.lineTotal += lineTotal;
      continue;
    }

    itemsByMenuItemId.set(menuItemId, {
      menuItemId,
      name: item.menuItem.name,
      imageUrl: item.menuItem.imageUrl,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal,
    });
  }

  const items = Array.from(itemsByMenuItemId.values()).sort(
    (firstItem, secondItem) => firstItem.menuItemId - secondItem.menuItemId,
  );
  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);

  return {
    id: order.id,
    tableId: order.tableId,
    createdAt: order.createdAt.toISOString(),
    items,
    totalQuantity,
    subtotal,
  };
}

export async function getCurrentOrderForTable(tableId: number) {
  const order = await prisma.order.findFirst({
    where: {
      tableId,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "asc",
    },
    select: currentOrderSelect,
  });

  return toCurrentOrderDTO(order);
}

export async function getCurrentOrderById(orderId: number) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: currentOrderSelect,
  });

  return toCurrentOrderDTO(order);
}

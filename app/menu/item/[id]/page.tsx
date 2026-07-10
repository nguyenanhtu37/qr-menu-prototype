import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getCurrentOrderForTable } from "@/lib/current-order";
import { prisma } from "@/lib/prisma";
import type { MenuCategory, MenuItemDTO } from "@/lib/menu-types";
import { parseTableIdParam } from "@/lib/table";
import { CustomerOrderShell } from "../../_components/customer-order-shell";
import { ItemDetail } from "../../_components/item-detail";
import { QrError } from "../../_components/qr-error";

type MenuItemPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function toMenuItemDTO(item: {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  category: string;
}): MenuItemDTO {
  return {
    ...item,
    category: item.category as MenuCategory,
  };
}

export default async function MenuItemPage({
  params,
  searchParams,
}: MenuItemPageProps) {
  await connection();

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const tableId = parseTableIdParam(query.tableId);
  const menuItemId = Number(id);

  if (!Number.isInteger(menuItemId) || menuItemId <= 0) {
    notFound();
  }

  if (!tableId) {
    return <QrError />;
  }

  const [table, rawMenuItem, rawMenuItems, currentOrder] = await Promise.all([
    prisma.table.findUnique({
      where: { id: tableId },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        price: true,
        category: true,
      },
    }),
    prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        price: true,
        category: true,
      },
    }),
    getCurrentOrderForTable(tableId),
  ]);

  if (!table) {
    return <QrError />;
  }

  if (!rawMenuItem) {
    notFound();
  }

  const menuItem = toMenuItemDTO(rawMenuItem);
  const menuItems = rawMenuItems.map(toMenuItemDTO);

  return (
    <CustomerOrderShell
      table={table}
      menuItems={menuItems}
      initialCurrentOrder={currentOrder}
    >
      <ItemDetail item={menuItem} tableId={table.id} />
    </CustomerOrderShell>
  );
}

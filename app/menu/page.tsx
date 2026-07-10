import { connection } from "next/server";
import { getCurrentOrderForTable } from "@/lib/current-order";
import { prisma } from "@/lib/prisma";
import {
  categoryLabels,
  categoryOrder,
  type MenuCategory,
  type MenuItemDTO,
} from "@/lib/menu-types";
import { parseTableIdParam } from "@/lib/table";
import { CustomerOrderShell } from "./_components/customer-order-shell";
import { MenuCard } from "./_components/menu-card";
import { QrError } from "./_components/qr-error";

type MenuPageProps = {
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

export default async function MenuPage({ searchParams }: MenuPageProps) {
  await connection();

  const query = await searchParams;
  const tableId = parseTableIdParam(query.tableId);

  if (!tableId) {
    return <QrError />;
  }

  const [table, rawMenuItems, currentOrder] = await Promise.all([
    prisma.table.findUnique({
      where: { id: tableId },
      select: {
        id: true,
        name: true,
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

  const menuItems = rawMenuItems.map(toMenuItemDTO);
  const orderedQuantitiesByMenuItemId = new Map(
    currentOrder?.items.map((item) => [item.menuItemId, item.quantity]) ?? [],
  );

  return (
    <CustomerOrderShell
      table={table}
      menuItems={menuItems}
      initialCurrentOrder={currentOrder}
    >
      <main className="bg-stone-50">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div>
              <p className="text-sm font-medium text-red-700">
                QR Menu Ordering
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                Seoul Garden BBQ
              </h1>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-sm font-medium text-stone-500">Bàn hiện tại</p>
              <p className="mt-1 text-xl font-semibold text-stone-950">
                {table.name}
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {categoryOrder.map((category) => {
              const items = menuItems.filter(
                (item) => item.category === category,
              );

              if (items.length === 0) {
                return null;
              }

              return (
                <section key={category}>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-stone-950">
                      {categoryLabels[category]}
                    </h2>
                    <span className="text-sm font-medium text-stone-500">
                      {items.length} món
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <MenuCard
                        key={item.id}
                        item={item}
                        tableId={table.id}
                        orderedQuantity={
                          orderedQuantitiesByMenuItemId.get(item.id) ?? 0
                        }
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </CustomerOrderShell>
  );
}

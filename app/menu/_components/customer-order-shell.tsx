"use client";

import { useState } from "react";
import type { MenuItemDTO, TableDTO } from "@/lib/menu-types";
import { CartProvider } from "./cart-context";
import { FloatingOrderSummary } from "./floating-order-summary";
import { OrderDrawer } from "./order-drawer";

type CustomerOrderShellProps = {
  table: TableDTO;
  menuItems: MenuItemDTO[];
  children: React.ReactNode;
};

export function CustomerOrderShell({
  table,
  menuItems,
  children,
}: CustomerOrderShellProps) {
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <CartProvider key={table.id} tableId={table.id} menuItems={menuItems}>
      <div className="min-h-screen pb-28">{children}</div>
      <FloatingOrderSummary onOpen={() => setReviewOpen(true)} />
      <OrderDrawer
        table={table}
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
      />
    </CartProvider>
  );
}

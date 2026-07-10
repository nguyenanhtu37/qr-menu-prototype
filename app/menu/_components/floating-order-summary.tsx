"use client";

import { formatVnd } from "@/lib/format";
import { useCart } from "./cart-context";

type FloatingOrderSummaryProps = {
  onOpen: () => void;
};

export function FloatingOrderSummary({ onOpen }: FloatingOrderSummaryProps) {
  const { currentOrder, totalQuantity, subtotal } = useCart();
  const orderedQuantity = currentOrder?.totalQuantity ?? 0;
  const orderedSubtotal = currentOrder?.subtotal ?? 0;
  const combinedQuantity = orderedQuantity + totalQuantity;
  const combinedSubtotal = orderedSubtotal + subtotal;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed bottom-5 left-4 right-4 z-40 flex min-h-14 items-center justify-between rounded-lg bg-zinc-950 px-5 py-4 text-left text-white shadow-2xl transition hover:bg-zinc-800 sm:left-auto sm:w-80"
    >
      <span className="text-sm font-semibold">
        {combinedQuantity} món | {formatVnd(combinedSubtotal)}
      </span>
      <span className="text-sm text-zinc-300">
        {totalQuantity > 0 ? "Xác nhận thêm" : "Xem order"}
      </span>
    </button>
  );
}

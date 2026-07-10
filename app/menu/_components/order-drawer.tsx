"use client";

import { useState } from "react";
import { formatVnd } from "@/lib/format";
import type { TableDTO } from "@/lib/menu-types";
import { useCart } from "./cart-context";

type OrderDrawerProps = {
  table: TableDTO;
  open: boolean;
  onClose: () => void;
};

export function OrderDrawer({ table, open, onClose }: OrderDrawerProps) {
  const {
    tableId,
    cartItems,
    subtotal,
    totalQuantity,
    setQuantity,
    clearCart,
  } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const visibleSuccessMessage = cartItems.length === 0 ? successMessage : null;

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId,
          items: cartItems.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
          })),
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Không thể xác nhận order.");
      }

      clearCart();
      setSuccessMessage(
        "Đặt món thành công. Đơn hàng của bạn đang nằm trong hàng đợi xử lý.",
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể xác nhận order.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45">
      <button
        type="button"
        aria-label="Đóng order"
        className="hidden flex-1 cursor-default sm:block"
        onClick={onClose}
      />

      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="border-b border-stone-200 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-stone-500">{table.name}</p>
              <h2 className="mt-1 text-xl font-semibold text-stone-950">
                Order hiện tại
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Đóng
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {visibleSuccessMessage ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium leading-6 text-emerald-800">
              {visibleSuccessMessage}
            </div>
          ) : null}

          {cartItems.length === 0 && !visibleSuccessMessage ? (
            <div className="rounded-lg border border-dashed border-stone-300 p-5 text-sm leading-6 text-stone-600">
              Order đang trống.
            </div>
          ) : null}

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.menuItem.id}
                className="rounded-lg border border-stone-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-stone-950">
                      {item.menuItem.name}
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">
                      {formatVnd(item.menuItem.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-stone-950">
                    {formatVnd(item.lineTotal)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex h-10 items-center rounded-lg border border-stone-200">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(item.menuItem.id, item.quantity - 1)
                      }
                      className="h-10 w-10 text-lg font-semibold text-stone-700 transition hover:bg-stone-100"
                      aria-label={`Giảm ${item.menuItem.name}`}
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-stone-950">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(item.menuItem.id, item.quantity + 1)
                      }
                      className="h-10 w-10 text-lg font-semibold text-stone-700 transition hover:bg-stone-100"
                      aria-label={`Tăng ${item.menuItem.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.menuItem.id, 0)}
                    className="text-sm font-medium text-red-600 transition hover:text-red-700"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-stone-200 px-5 py-4">
          {error ? (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mb-4 flex items-center justify-between text-base font-semibold text-stone-950">
            <span>Tổng cộng</span>
            <span>{formatVnd(subtotal)}</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || totalQuantity === 0}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {submitting ? "Đang xác nhận..." : "Xác nhận đặt món"}
          </button>
        </div>
      </aside>
    </div>
  );
}

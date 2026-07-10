"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatVnd } from "@/lib/format";
import type { TableDTO } from "@/lib/menu-types";
import type { CurrentOrderDTO } from "@/lib/order-types";
import { useCart } from "./cart-context";

type OrderDrawerProps = {
  table: TableDTO;
  open: boolean;
  onClose: () => void;
};

export function OrderDrawer({ table, open, onClose }: OrderDrawerProps) {
  const router = useRouter();
  const {
    tableId,
    currentOrder,
    currentOrderLoading,
    cartItems,
    subtotal,
    totalQuantity,
    setQuantity,
    clearCart,
    refreshCurrentOrder,
    setCurrentOrder,
  } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [completingOrder, setCompletingOrder] = useState(false);
  const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const orderedItems = currentOrder?.items ?? [];
  const orderedQuantity = currentOrder?.totalQuantity ?? 0;
  const orderedSubtotal = currentOrder?.subtotal ?? 0;
  const projectedQuantity = orderedQuantity + totalQuantity;
  const projectedSubtotal = orderedSubtotal + subtotal;
  const visibleSuccessMessage = cartItems.length === 0 ? successMessage : null;
  const canCompleteMeal = orderedQuantity > 0 && totalQuantity === 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    refreshCurrentOrder().catch((refreshError) => {
      if (cancelled) {
        return;
      }

      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Không thể tải order hiện tại.",
      );
    });

    return () => {
      cancelled = true;
    };
  }, [open, refreshCurrentOrder]);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    if (totalQuantity === 0) {
      return;
    }

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
        order?: CurrentOrderDTO | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Không thể xác nhận order.");
      }

      setCurrentOrder(result.order ?? null);
      clearCart();
      router.refresh();
      setSuccessMessage(
        orderedQuantity > 0
          ? "Gọi thêm món thành công. Danh sách đã gọi đã được cập nhật."
          : "Đặt món thành công. Đơn hàng của bạn đang nằm trong hàng đợi xử lý.",
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

  async function handleCompleteMeal() {
    if (!canCompleteMeal) {
      return;
    }

    setCompletingOrder(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Không thể kết thúc bữa ăn.");
      }

      setCurrentOrder(null);
      clearCart();
      setCompleteConfirmOpen(false);
      router.refresh();
      setSuccessMessage("Đã kết thúc bữa ăn. Bàn này hiện đang trống.");
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : "Không thể kết thúc bữa ăn.",
      );
    } finally {
      setCompletingOrder(false);
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

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
          {visibleSuccessMessage ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium leading-6 text-emerald-800">
              {visibleSuccessMessage}
            </div>
          ) : null}

          {currentOrderLoading ? (
            <p className="rounded-lg bg-stone-50 px-4 py-3 text-sm font-medium text-stone-600">
              Đang cập nhật order...
            </p>
          ) : null}

          <section>
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Đã gọi
              </h3>
              <span className="text-sm font-semibold text-stone-950">
                {orderedQuantity} món
              </span>
            </div>

            {orderedItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-stone-300 p-5 text-sm leading-6 text-stone-600">
                Bàn này chưa có món nào được xác nhận.
              </div>
            ) : (
              <div className="space-y-3">
                {orderedItems.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="rounded-lg border border-stone-200 bg-stone-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-stone-950">
                          {item.name}
                        </h4>
                        <p className="mt-1 text-sm text-stone-500">
                          {item.quantity} x {formatVnd(item.unitPrice)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-stone-950">
                        {formatVnd(item.lineTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Gọi thêm
              </h3>
              <span className="text-sm font-semibold text-stone-950">
                {totalQuantity} món
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-stone-300 p-5 text-sm leading-6 text-stone-600">
                Chưa chọn thêm món nào.
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="rounded-lg border border-stone-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-stone-950">
                          {item.menuItem.name}
                        </h4>
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
            )}
          </section>
        </div>

        <div className="border-t border-stone-200 px-5 py-4">
          {error ? (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mb-4 space-y-2 text-sm">
            <div className="flex items-center justify-between text-stone-600">
              <span>Đã gọi</span>
              <span className="font-semibold text-stone-950">
                {formatVnd(orderedSubtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-600">
              <span>Gọi thêm</span>
              <span className="font-semibold text-stone-950">
                {formatVnd(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-base font-semibold text-stone-950">
              <span>Tổng cộng</span>
              <span>{formatVnd(projectedSubtotal)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || completingOrder || totalQuantity === 0}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {submitting
              ? "Đang xác nhận..."
              : orderedQuantity > 0
                ? "Xác nhận gọi thêm"
                : "Xác nhận đặt món"}
          </button>

          {orderedQuantity > 0 ? (
            <button
              type="button"
              onClick={() => setCompleteConfirmOpen(true)}
              disabled={!canCompleteMeal || submitting || completingOrder}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-stone-300 px-4 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
            >
              {completingOrder
                ? "Đang kết thúc..."
                : "Xác nhận đã dùng bữa xong"}
            </button>
          ) : null}

          {orderedQuantity > 0 && totalQuantity > 0 ? (
            <p className="mt-3 text-center text-xs font-medium leading-5 text-stone-500">
              Xác nhận hoặc xóa các món gọi thêm trước khi kết thúc bữa ăn.
            </p>
          ) : null}

          <p className="mt-3 text-center text-xs font-medium text-stone-500">
            {projectedQuantity} món trong order hiện tại
          </p>
        </div>
      </aside>

      {completeConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-stone-950">
              Kết thúc bữa ăn?
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Order hiện tại sẽ được đóng và bàn này sẽ trống cho lượt khách
              tiếp theo. Lịch sử order vẫn được giữ trong database.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCompleteConfirmOpen(false)}
                disabled={completingOrder}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-400"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCompleteMeal}
                disabled={completingOrder}
                className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {completingOrder ? "Đang xử lý..." : "Kết thúc"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

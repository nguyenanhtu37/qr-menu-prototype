"use client";

import Link from "next/link";
import { useState } from "react";
import { formatVnd } from "@/lib/format";
import type { MenuItemDTO } from "@/lib/menu-types";
import { useCart } from "./cart-context";
import { MenuImage } from "./menu-image";

type ItemDetailProps = {
  item: MenuItemDTO;
  tableId: number;
};

export function ItemDetail({ item, tableId }: ItemDetailProps) {
  const { getQuantity, addItem, setQuantity, removeItem } = useCart();
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cartQuantity = getQuantity(item.id);
  const isInCart = cartQuantity > 0;
  const quantity = isInCart ? cartQuantity : draftQuantity;

  function increaseQuantity() {
    if (isInCart) {
      setQuantity(item.id, quantity + 1);
      return;
    }

    setDraftQuantity((currentQuantity) => currentQuantity + 1);
  }

  function decreaseQuantity() {
    if (quantity <= 1) {
      setConfirmOpen(true);
      return;
    }

    if (isInCart) {
      setQuantity(item.id, quantity - 1);
      return;
    }

    setDraftQuantity((currentQuantity) => Math.max(1, currentQuantity - 1));
  }

  function confirmRemove() {
    if (isInCart) {
      removeItem(item.id);
    }

    setDraftQuantity(1);
    setConfirmOpen(false);
  }

  return (
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-5 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-8">
        <div>
          <Link
            href={`/menu?tableId=${tableId}`}
            className="inline-flex rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
          >
            Quay lại menu
          </Link>

          <MenuImage
            src={item.imageUrl}
            alt={item.name}
            className="mt-5 aspect-[4/3] rounded-lg shadow-sm"
            preload
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-medium text-red-700">Seoul Garden BBQ</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-stone-950">
            {item.name}
          </h1>
          <p className="mt-3 text-xl font-semibold text-red-700">
            {formatVnd(item.price)}
          </p>
          <p className="mt-5 text-base leading-8 text-stone-600">
            {item.description}
          </p>

          <div className="mt-8">
            <p className="text-sm font-semibold text-stone-950">Số lượng</p>
            <div className="mt-3 flex h-12 w-40 items-center rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={decreaseQuantity}
                className="h-12 w-12 text-xl font-semibold text-stone-700 transition hover:bg-stone-100"
                aria-label={`Giảm ${item.name}`}
              >
                -
              </button>
              <span className="w-16 text-center text-base font-semibold text-stone-950">
                {quantity}
              </span>
              <button
                type="button"
                onClick={increaseQuantity}
                className="h-12 w-12 text-xl font-semibold text-stone-700 transition hover:bg-stone-100"
                aria-label={`Tăng ${item.name}`}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-stone-50 p-4">
            <div className="flex items-center justify-between text-sm text-stone-600">
              <span>Tạm tính</span>
              <span className="font-semibold text-stone-950">
                {formatVnd(item.price * quantity)}
              </span>
            </div>
          </div>

          {isInCart ? (
            <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              Món này đã có trong order.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => addItem(item.id, draftQuantity)}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Thêm vào order
            </button>
          )}
        </section>
      </main>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-stone-950">
              Bạn có muốn xóa món này khỏi order không?
            </h2>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

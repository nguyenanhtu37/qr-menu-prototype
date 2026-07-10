"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MenuItemDTO } from "@/lib/menu-types";

type CartState = Record<string, number>;

export type CartLine = {
  menuItem: MenuItemDTO;
  quantity: number;
  lineTotal: number;
};

type CartContextValue = {
  tableId: number;
  cartItems: CartLine[];
  totalQuantity: number;
  subtotal: number;
  getQuantity: (menuItemId: number) => number;
  addItem: (menuItemId: number, quantity?: number) => void;
  setQuantity: (menuItemId: number, quantity: number) => void;
  removeItem: (menuItemId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCart(value: unknown): CartState {
  if (!isRecord(value)) {
    return {};
  }

  const nextCart: CartState = {};

  for (const [key, quantityValue] of Object.entries(value)) {
    const menuItemId = Number(key);
    const quantity = Number(quantityValue);

    if (Number.isInteger(menuItemId) && Number.isInteger(quantity) && quantity > 0) {
      nextCart[String(menuItemId)] = quantity;
    }
  }

  return nextCart;
}

function readCart(storageKey: string): CartState {
  try {
    const rawCart = window.localStorage.getItem(storageKey);

    if (!rawCart) {
      return {};
    }

    return normalizeCart(JSON.parse(rawCart));
  } catch {
    return {};
  }
}

type CartProviderProps = {
  tableId: number;
  menuItems: MenuItemDTO[];
  children: React.ReactNode;
};

export function CartProvider({
  tableId,
  menuItems,
  children,
}: CartProviderProps) {
  const storageKey = `qr-menu-cart:${tableId}`;
  const [cart, setCart] = useState<CartState>({});
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCart(readCart(storageKey));
      setLoadedStorageKey(storageKey);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [storageKey]);

  useEffect(() => {
    if (loadedStorageKey !== storageKey) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, loadedStorageKey, storageKey]);

  const menuItemsById = useMemo(() => {
    return new Map(menuItems.map((item) => [item.id, item]));
  }, [menuItems]);

  const cartItems = useMemo(() => {
    const lines: CartLine[] = [];

    for (const [menuItemId, quantity] of Object.entries(cart)) {
      const menuItem = menuItemsById.get(Number(menuItemId));

      if (!menuItem) {
        continue;
      }

      lines.push({
        menuItem,
        quantity,
        lineTotal: menuItem.price * quantity,
      });
    }

    return lines.sort((first, second) => first.menuItem.id - second.menuItem.id);
  }, [cart, menuItemsById]);

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const subtotal = cartItems.reduce((total, item) => total + item.lineTotal, 0);

  const getQuantity = useCallback(
    (menuItemId: number) => cart[String(menuItemId)] ?? 0,
    [cart],
  );

  const addItem = useCallback((menuItemId: number, quantity = 1) => {
    setCart((currentCart) => ({
      ...currentCart,
      [String(menuItemId)]:
        (currentCart[String(menuItemId)] ?? 0) + Math.max(1, quantity),
    }));
  }, []);

  const setQuantity = useCallback((menuItemId: number, quantity: number) => {
    setCart((currentCart) => {
      const nextCart = { ...currentCart };
      const key = String(menuItemId);

      if (quantity <= 0) {
        delete nextCart[key];
      } else {
        nextCart[key] = quantity;
      }

      return nextCart;
    });
  }, []);

  const removeItem = useCallback((menuItemId: number) => {
    setCart((currentCart) => {
      const nextCart = { ...currentCart };
      delete nextCart[String(menuItemId)];
      return nextCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      tableId,
      cartItems,
      totalQuantity,
      subtotal,
      getQuantity,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [
      tableId,
      cartItems,
      totalQuantity,
      subtotal,
      getQuantity,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return value;
}

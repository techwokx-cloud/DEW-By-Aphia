"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQty: (productId: string, color: string, size: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "dew_cart_v1";

function sameLine(a: CartItem, productId: string, color: string, size: string) {
  return a.productId === productId && a.color === color && a.size === size;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable — cart just won't persist across reloads
    }
  }, [items, loaded]);

  function addItem(item: Omit<CartItem, "qty">) {
    setItems((prev) => {
      const existing = prev.find((l) => sameLine(l, item.productId, item.color, item.size));
      if (existing) {
        return prev.map((l) =>
          sameLine(l, item.productId, item.color, item.size) ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function removeItem(productId: string, color: string, size: string) {
    setItems((prev) => prev.filter((l) => !sameLine(l, productId, color, size)));
  }

  function updateQty(productId: string, color: string, size: string, qty: number) {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((l) => (sameLine(l, productId, color, size) ? { ...l, qty } : l))
    );
  }

  function clear() {
    setItems([]);
  }

  const count = items.reduce((sum, l) => sum + l.qty, 0);
  const subtotal = items.reduce((sum, l) => sum + l.qty * l.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

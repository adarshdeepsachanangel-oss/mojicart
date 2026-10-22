"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItemType {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  title: string;
  variantTitle?: string;
  imageUrl?: string;
  price: number;
  mrp: number;
  stock: number;
  isOutOfStock: boolean;
  itemTotal: number;
  seller?: {
    id: string;
    storeName: string;
  };
}

interface CartContextType {
  items: CartItemType[];
  subtotal: number;
  shippingFee: number;
  finalTotal: number;
  totalItems: number;
  loading: boolean;
  addToCart: (productId: string, variantId?: string | null, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, newQty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [],
  subtotal: 0,
  shippingFee: 0,
  finalTotal: 0,
  totalItems: 0,
  loading: true,
  addToCart: async () => ({ success: false }),
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    let sid = localStorage.getItem("mojicart_guest_session");
    if (!sid) {
      sid = "guest_" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem("mojicart_guest_session", sid);
    }
    setSessionId(sid);
  }, []);

  const refreshCart = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/v1/cart?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setSubtotal(data.subtotal || 0);
        setShippingFee(data.shippingFee || 0);
        setFinalTotal(data.finalTotal || 0);
        setTotalItems(data.totalItems || 0);
      }
    } catch (err) {
      console.error("Cart refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      refreshCart();
    }
  }, [sessionId]);

  const addToCart = async (productId: string, variantId?: string | null, quantity: number = 1) => {
    try {
      const res = await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, quantity, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to add to cart" };
      }
      await refreshCart();
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await fetch(`/api/v1/cart?itemId=${itemId}`, { method: "DELETE" });
      await refreshCart();
    } catch (err) {
      console.error("Remove item error:", err);
    }
  };

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      await removeItem(itemId);
      return;
    }
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) return;

    const diff = newQty - targetItem.quantity;
    await addToCart(targetItem.productId, targetItem.variantId, diff);
  };

  const clearCart = async () => {
    try {
      await fetch(`/api/v1/cart?sessionId=${sessionId}`, { method: "DELETE" });
      await refreshCart();
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        shippingFee,
        finalTotal,
        totalItems,
        loading,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

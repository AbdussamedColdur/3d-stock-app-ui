import { useState, useEffect, useCallback } from "react";
import {
  getPrimaryCategoryName,
  getPrimaryImage,
  normalizeProduct,
} from "utils/productModel";

const CART_STORAGE_KEY = "lbd_cart";

const loadCart = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        const product = normalizeProduct(item);
        const quantity = Number.parseInt(item && item.quantity, 10);
        if (product.id <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
          return null;
        }

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: getPrimaryCategoryName(product),
          imageUrl: getPrimaryImage(product),
          quantity,
        };
      })
      .filter(Boolean);
  } catch (e) {
    console.error("Error loading cart from localStorage:", e);
    return [];
  }
};

const saveCart = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Error saving cart to localStorage:", e);
  }
};

export default function useCart() {
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    const safeProduct = normalizeProduct(product);
    const safeQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1);
    if (safeProduct.id <= 0 || safeProduct.stock === 0) {
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === safeProduct.id);
      if (existingItem) {
        const nextQuantity = Math.min(
          existingItem.quantity + safeQuantity,
          Math.max(1, safeProduct.stock)
        );

        return prev.map((item) =>
          item.id === safeProduct.id
            ? { ...item, quantity: nextQuantity }
            : item
        );
      }

      return [
        ...prev,
        {
          id: safeProduct.id,
          name: safeProduct.name,
          price: safeProduct.price,
          stock: safeProduct.stock,
          category: getPrimaryCategoryName(safeProduct),
          imageUrl: getPrimaryImage(safeProduct),
          quantity: Math.min(safeQuantity, Math.max(1, safeProduct.stock)),
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const safeQuantity = Number.parseInt(quantity, 10);
    if (!Number.isInteger(safeQuantity) || safeQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: Math.min(
                safeQuantity,
                item.stock > 0 ? item.stock : safeQuantity
              ),
            }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  };
}

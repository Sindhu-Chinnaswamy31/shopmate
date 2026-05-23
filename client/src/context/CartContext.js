import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart for current logged in user only
    const user = localStorage.getItem("user");
    if (!user) return [];
    const userId = JSON.parse(user).id;
    const saved = localStorage.getItem(`cart_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return;
    const userId = JSON.parse(user).id;
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    if (product.stock === 0) return; // guard
    setCartItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        // Don't exceed stock
        if (exists.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id === productId) {
          // Don't exceed available stock
          const newQty = Math.min(quantity, item.stock);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    const user = localStorage.getItem("user");
    if (user) {
      const userId = JSON.parse(user).id;
      localStorage.removeItem(`cart_${userId}`);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

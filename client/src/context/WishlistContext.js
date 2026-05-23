import React, { createContext, useState, useContext, useEffect } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    const user = localStorage.getItem("user");
    if (!user) return [];
    const userId = JSON.parse(user).id;
    const saved = localStorage.getItem(`wishlist_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return;
    const userId = JSON.parse(user).id;
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) return prev.filter((item) => item._id !== product._id);
      return [...prev, product];
    });
  };

  const isWishlisted = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, isWishlisted }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

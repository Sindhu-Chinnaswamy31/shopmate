import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";
import { WishlistProvider } from "./context/WishlistContext";
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <CartProvider>
      <WishlistProvider>
        <RecentlyViewedProvider>
          <App />
          <Toaster position="top-right" />
        </RecentlyViewedProvider>
      </WishlistProvider>
    </CartProvider>
  </AuthProvider>
);

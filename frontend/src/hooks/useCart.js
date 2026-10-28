import { useContext } from "react";
import CartContext from "../context/CartContext.jsx";

export default function useCart() {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error("useCart must be used inside a CartProvider.");
  }

  return context;
}

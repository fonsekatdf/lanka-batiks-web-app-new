import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "lanka-batiks-cart";

function readStoredCart() {
  try {
    const storedCart = localStorage.getItem(STORAGE_KEY);

    if (!storedCart) return [];

    const parsedCart = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart)) return [];

    return parsedCart.filter(
      (item) =>
        item &&
        typeof item._id === "string" &&
        typeof item.name === "string" &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isInteger(item.stock) &&
        item.stock >= item.quantity &&
        Array.isArray(item.images)
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Unable to save cart to local storage:", error);
    }
  }, [items]);

  const addToCart = useCallback(
    (product, quantity = 1) => {
      const price = Number(product?.price);
      const stock = product?.stock;

      if (
        !product?._id ||
        typeof product.name !== "string" ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(stock) ||
        stock <= 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return {
          success: false,
          message: "This product cannot be added to the cart.",
        };
      }

      const productId = String(product._id);
      const existingItem = items.find((item) => item._id === productId);
      const currentQuantity = existingItem?.quantity ?? 0;
      const nextQuantity = currentQuantity + quantity;

      if (nextQuantity > stock) {
        return {
          success: false,
          message: `Only ${stock} item(s) are available.`,
        };
      }

      const normalizedProduct = {
        _id: productId,
        name: product.name,
        price,
        images: Array.isArray(product.images) ? product.images : [],
        category: product.category ?? "",
        stock,
        quantity: nextQuantity,
      };

      if (existingItem) {
        setItems((currentItems) =>
          currentItems.map((item) =>
            item._id === productId ? normalizedProduct : item
          )
        );
      } else {
        setItems((currentItems) => [
          ...currentItems,
          normalizedProduct,
        ]);
      }

      return {
        success: true,
        message: "Product added to cart.",
      };
    },
    [items]
  );

  const updateQuantity = useCallback(
    (productId, quantity) => {
      if (!Number.isInteger(quantity) || quantity < 1) {
        return {
          success: false,
          message: "Quantity must be a whole number greater than zero.",
        };
      }

      const item = items.find((entry) => entry._id === productId);

      if (!item) {
        return {
          success: false,
          message: "Product not found in cart.",
        };
      }

      if (quantity > item.stock) {
        return {
          success: false,
          message: `Only ${item.stock} item(s) are available.`,
        };
      }

      setItems((currentItems) =>
        currentItems.map((entry) =>
          entry._id === productId
            ? { ...entry, quantity }
            : entry
        )
      );

      return {
        success: true,
        message: "Quantity updated.",
      };
    },
    [items]
  );

  const removeFromCart = useCallback((productId) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item._id !== productId)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [items]
  );

  const formatLKR = useCallback(
    (amount) =>
      `LKR ${Number(amount).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    []
  );

  const value = useMemo(
    () => ({
      items,
      cartCount,
      subtotal,
      total: subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      formatLKR,
    }),
    [
      items,
      cartCount,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      formatLKR,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;

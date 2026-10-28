import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "lanka-batiks-cart";

const readStoredCart = () => {
  try {
    const storedCart = localStorage.getItem(STORAGE_KEY);

    if (!storedCart) {
      return [];
    }

    const parsedCart = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

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
        item.stock >= 0 &&
        item.quantity <= item.stock
    );
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  // Persist the cart whenever its contents change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Unable to save cart to local storage:", error);
    }
  }, [items]);

  // Add a product or increase its existing quantity.
  const addToCart = useCallback((product, quantity = 1) => {
    if (
      !product?._id ||
      typeof product.name !== "string" ||
      !Number.isFinite(Number(product.price)) ||
      Number(product.price) < 0 ||
      !Number.isInteger(product.stock) ||
      product.stock <= 0 ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return { success: false, message: "This product cannot be added to the cart." };
    }

    const normalizedProduct = {
      _id: String(product._id),
      name: product.name,
      price: Number(product.price),
      images: Array.isArray(product.images) ? product.images : [],
      category: product.category ?? "",
      stock: product.stock,
    };

    let result = {
      success: false,
      message: "Unable to add this product.",
    };

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item._id === normalizedProduct._id
      );

      const currentQuantity = existingItem?.quantity ?? 0;
      const nextQuantity = currentQuantity + quantity;

      if (nextQuantity > normalizedProduct.stock) {
        result = {
          success: false,
          message: `Only ${normalizedProduct.stock} item(s) are available.`,
        };
        return currentItems;
      }

      result = {
        success: true,
        message: "Product added to cart.",
      };

      if (existingItem) {
        return currentItems.map((item) =>
          item._id === normalizedProduct._id
            ? { ...item, quantity: nextQuantity, ...normalizedProduct }
            : item
        );
      }

      return [
        ...currentItems,
        { ...normalizedProduct, quantity },
      ];
    });

    return result;
  }, []);

  // Set an item's quantity, enforcing the available stock limit.
  const updateQuantity = useCallback((productId, quantity) => {
    if (!Number.isInteger(quantity)) {
      return { success: false, message: "Quantity must be a whole number." };
    }

    if (quantity <= 0) {
      return { success: false, message: "Quantity must be at least one." };
    }

    let result = {
      success: false,
      message: "Product not found in cart.",
    };

    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item._id !== productId) {
          return item;
        }

        if (quantity > item.stock) {
          result = {
            success: false,
            message: `Only ${item.stock} item(s) are available.`,
          };
          return item;
        }

        result = { success: true, message: "Quantity updated." };

        return { ...item, quantity };
      })
    );

    return result;
  }, []);

  // Remove one product from the cart.
  const removeFromCart = useCallback((productId) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item._id !== productId)
    );
  }, []);

  // Empty the entire cart.
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Calculate totals from the current cart state.
  const cartCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price * item.quantity,
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

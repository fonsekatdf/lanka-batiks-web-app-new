import { Link } from "react-router-dom";
import useCart from "../hooks/useCart.js";
import "./Cart.css";

function Cart() {
  const {
    items,
    cartCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    formatLKR,
  } = useCart();

  if (items.length === 0) {
    return (
      <section className="container page-section cart-page">
        <div className="cart-heading">
          <p className="eyebrow">YOUR SELECTION</p>
          <h1>Your Shopping Cart</h1>
        </div>

        <div className="cart-empty">
          <div className="cart-empty-icon" aria-hidden="true">
            LB
          </div>

          <h2>Your cart is waiting for something beautiful.</h2>

          <p>
            Discover handcrafted batik pieces inspired by the colours and
            traditions of Sri Lanka.
          </p>

          <Link to="/products" className="button button-primary">
            Explore Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container page-section cart-page">
      <div className="cart-heading">
        <p className="eyebrow">YOUR SELECTION</p>
        <h1>Your Shopping Cart</h1>
        <p>
          {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => {
            const imageUrl = item.images?.find(
              (image) => typeof image === "string" && image.trim().length > 0,
            );

            return (
              <article className="cart-item" key={item._id}>
                <Link
                  to={`/products/${item._id}`}
                  className="cart-item-image"
                  aria-label={`View ${item.name}`}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.name} />
                  ) : (
                    <span aria-hidden="true">Lanka Batiks</span>
                  )}
                </Link>

                <div className="cart-item-info">
                  <p className="product-category">{item.category}</p>

                  <h2>
                    <Link to={`/products/${item._id}`}>{item.name}</Link>
                  </h2>

                  <p className="cart-item-price">{formatLKR(item.price)}</p>

                  <p className="cart-item-stock">{item.stock} available</p>

                  <div className="cart-item-actions">
                    <div
                      className="quantity-control"
                      aria-label={`Quantity for ${item.name}`}
                    >
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                      >
                        -
                      </button>

                      <span aria-live="polite">{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        disabled={item.quantity >= item.stock}
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p className="cart-line-total">
                  {formatLKR(item.price * item.quantity)}
                </p>
              </article>
            );
          })}

          <button
            type="button"
            className="cart-clear-button"
            onClick={clearCart}
          >
            Clear cart
          </button>
        </div>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="cart-summary-row">
            <span>Items ({cartCount})</span>
            <span>{formatLKR(subtotal)}</span>
          </div>

          <div className="cart-summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="cart-summary-total">
            <span>Subtotal</span>
            <strong>{formatLKR(subtotal)}</strong>
          </div>

          <p className="cart-summary-note">
            Shipping and any applicable fees are not included.
          </p>

          <Link
            to="/checkout"
            className="button button-primary cart-checkout-button"
          >
            <span>Proceed to checkout</span>
            <span className="checkout-button-arrow" aria-hidden="true">
              →
            </span>
          </Link>

          <Link to="/products" className="cart-continue-link">
            Continue shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default Cart;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import useCart from "../../hooks/useCart.js";
import orderService from "../../services/orderService.js";

import "./Checkout.css";

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
};

function Checkout() {
  const { token, user } = useAuth();
  const { items, subtotal, clearCart, formatLKR } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState(() => ({
    ...initialAddress,
    fullName: user?.name ?? "",
  }));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setAddress((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      navigate("/login", {
        state: { from: "/checkout" },
        replace: true,
      });
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await orderService.createOrder({
        items,
        shippingAddress: address,
        token,
      });

      const order = result?.data?.order;

      if (!result?.success || !order?._id) {
        throw new Error(
          "The server did not confirm your order. Please check your orders before retrying.",
        );
      }

      // Clear the cart only after the server confirms success.
      clearCart();

      navigate("/order-confirmation", {
        replace: true,
        state: { order },
      });
    } catch (requestError) {
      const serverMessage = requestError.response?.data?.message;

      setError(
        serverMessage ||
          requestError.message ||
          "We could not place your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="container page-section checkout-page">
        <div className="checkout-empty">
          <p className="eyebrow">CHECKOUT</p>
          <h1>Your cart is empty</h1>
          <p>Add something beautiful from our collection before checking out.</p>
          <Link to="/products" className="button button-primary">
            Explore Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container page-section checkout-page">
      <div className="checkout-heading">
        <p className="eyebrow">ALMOST YOURS</p>
        <h1>Checkout</h1>
        <p>Enter your delivery details to place your order.</p>
      </div>

      <form className="checkout-layout" onSubmit={handleSubmit}>
        <div className="checkout-form-panel">
          <section className="checkout-section">
            <h2>Delivery information</h2>

            <div className="checkout-fields">
              <div className="checkout-field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={address.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={address.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  minLength={7}
                  maxLength={20}
                  required
                />
              </div>

              <div className="checkout-field checkout-field-full">
                <label htmlFor="addressLine1">Address line 1</label>
                <input
                  id="addressLine1"
                  name="addressLine1"
                  value={address.addressLine1}
                  onChange={handleChange}
                  autoComplete="address-line1"
                  minLength={3}
                  maxLength={200}
                  required
                />
              </div>

              <div className="checkout-field checkout-field-full">
                <label htmlFor="addressLine2">
                  Address line 2 (optional)
                </label>
                <input
                  id="addressLine2"
                  name="addressLine2"
                  value={address.addressLine2}
                  onChange={handleChange}
                  autoComplete="address-line2"
                  maxLength={200}
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="postalCode">Postal code (optional)</label>
                <input
                  id="postalCode"
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleChange}
                  autoComplete="postal-code"
                  maxLength={20}
                />
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h2>Payment method</h2>

            <label className="checkout-payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cash_on_delivery"
                checked
                readOnly
              />
              <span>
                <strong>Cash on delivery</strong>
                <span>Pay when your order is delivered.</span>
              </span>
            </label>
          </section>

          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button button-primary checkout-submit"
            disabled={submitting}
          >
            {submitting ? "Placing order..." : "Place order"}
          </button>

          <Link to="/cart" className="checkout-back-link">
            Return to cart
          </Link>
        </div>

        <aside className="checkout-summary">
          <h2>Your order</h2>

          <div className="checkout-summary-items">
            {items.map((item) => (
              <div className="checkout-summary-item" key={item._id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>Quantity: {item.quantity}</span>
                </div>
                <span>{formatLKR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>{formatLKR(subtotal)}</span>
          </div>

          <div className="checkout-summary-row">
            <span>Shipping</span>
            <span>Not included</span>
          </div>

          <div className="checkout-summary-total">
            <strong>Total</strong>
            <strong>{formatLKR(subtotal)}</strong>
          </div>

          <p className="checkout-summary-note">
            Shipping charges are not included in this total. The final amount
            is calculated by the server when you place your order.
          </p>
        </aside>
      </form>
    </section>
  );
}

export default Checkout;

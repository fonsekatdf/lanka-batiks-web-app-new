import { Link, useLocation } from "react-router-dom";
import "./OrderConfirmation.css";

const formatLKR = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  // The order is passed here after the backend confirms its creation.
  // Do not display a fake order if someone opens this URL directly.
  if (!order?._id) {
    return (
      <section className="container page-section order-confirmation">
        <div className="order-confirmation-card">
          <h1>Order details unavailable</h1>
          <p>
            We could not find order details for this page. Please check your
            account or contact support if you believe your order was placed.
          </p>
          <Link to="/products" className="button button-primary">
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  const items = order.items ?? [];
  const shippingAddress = order.shippingAddress ?? {};

  return (
    <section className="container page-section order-confirmation">
      <div className="order-confirmation-card">
        <div className="order-confirmation-icon" aria-hidden="true">
          ✓
        </div>

        <p className="order-confirmation-eyebrow">Lanka Batiks</p>
        <h1>Thank you for your order!</h1>
        <p className="order-confirmation-message">
          Your order has been submitted successfully.
        </p>

        <div className="order-confirmation-number">
          <span>Order number</span>
          <strong>{order._id}</strong>
        </div>

        <div className="order-confirmation-details">
          <div>
            <span>Order status</span>
            <strong>{order.status ?? "Pending"}</strong>
          </div>
          <div>
            <span>Payment method</span>
            <strong>Cash on delivery</strong>
          </div>
          <div>
            <span>Order total</span>
            <strong>{formatLKR(order.total)}</strong>
          </div>
        </div>

        <div className="order-confirmation-section">
          <h2>Items ordered</h2>

          {items.length === 0 ? (
            <p>Item details are unavailable.</p>
          ) : (
            <ul className="order-confirmation-items">
              {items.map((item, index) => (
                <li key={item.product ?? `${item.name}-${index}`}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>Quantity: {item.quantity}</span>
                  </div>
                  <strong>{formatLKR(item.lineTotal)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="order-confirmation-section">
          <h2>Delivery address</h2>
          <address className="order-confirmation-address">
            <strong>{shippingAddress.fullName}</strong>
            <span>{shippingAddress.phone}</span>
            <span>{shippingAddress.addressLine1}</span>
            {shippingAddress.addressLine2 && (
              <span>{shippingAddress.addressLine2}</span>
            )}
            <span>
              {shippingAddress.city}
              {shippingAddress.postalCode
                ? `, ${shippingAddress.postalCode}`
                : ""}
            </span>
          </address>
        </div>

        <div className="order-confirmation-actions">
          <Link to="/products" className="button button-primary">
            Continue shopping
          </Link>
          <Link to="/account" className="button button-secondary">
            My account
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OrderConfirmation;

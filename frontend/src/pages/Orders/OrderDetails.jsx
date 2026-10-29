import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import orderHistoryService from "../../services/orderHistoryService.js";

import "./Orders.css";

const formatLKR = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function OrderDetails() {
  const { id } = useParams();
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      setLoading(true);
      setError("");
      setOrder(null);

      try {
        const result = await orderHistoryService.getOrderById(id, token);

        if (!result?.success || !result?.data?.order?._id) {
          throw new Error("The server returned an unexpected order response.");
        }

        if (active) {
          setOrder(result.data.order);
        }
      } catch (requestError) {
        if (!active) return;

        if (requestError.response?.status === 401) {
          logout();
          navigate("/login", {
            replace: true,
            state: { from: `/account/orders/${id}` },
          });
          return;
        }

        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "We couldn't load this order.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    if (token && id) {
      loadOrder();
    } else {
      setLoading(false);
      setError("Order details are unavailable.");
    }

    return () => {
      active = false;
    };
  }, [id, token, logout, navigate]);

  return (
    <section className="page-section">
      <div className="container orders-page">
        <Link className="orders-back-link" to="/account/orders">
          ← Back to My Orders
        </Link>

        {loading && (
          <div className="orders-message">
            <p>Loading order details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="orders-message orders-error" role="alert">
            <h1>Order unavailable</h1>
            <p>{error}</p>
            <Link className="button button-primary" to="/account/orders">
              Return to My Orders
            </Link>
          </div>
        )}

        {!loading && !error && order && (
          <>
            <div className="orders-heading">
              <div>
                <p className="eyebrow">Order details</p>
                <h1>Your order</h1>
                <p className="order-id">{order._id}</p>
              </div>

              <span
                className={`order-status order-status-${String(
                  order.status || "pending",
                ).toLowerCase()}`}
              >
                {order.status || "Pending"}
              </span>
            </div>

            <div className="order-details-grid">
              <section className="order-details-panel">
                <h2>Items ordered</h2>

                <div className="order-detail-items">
                  {(order.items || []).map((item, index) => (
                    <div
                      className="order-detail-item"
                      key={item.product || `${item.name}-${index}`}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name || "Product"}
                        />
                      )}

                      <div className="order-detail-product">
                        <strong>{item.name}</strong>
                        <span>Quantity: {item.quantity}</span>
                        <span>Unit price: {formatLKR(item.unitPrice)}</span>
                      </div>

                      <strong>{formatLKR(item.lineTotal)}</strong>
                    </div>
                  ))}
                </div>

                <div className="order-total-row">
                  <span>Subtotal</span>
                  <strong>{formatLKR(order.subtotal)}</strong>
                </div>

                <div className="order-total-row order-total-final">
                  <span>Total</span>
                  <strong>{formatLKR(order.total)}</strong>
                </div>

                <p className="order-payment-note">
                  Payment method: Cash on delivery
                </p>
                <p className="order-payment-note">
                  Payment status: {order.paymentStatus || "Pending"}
                </p>
              </section>

              <aside className="order-details-panel">
                <h2>Delivery information</h2>

                <address className="order-address">
                  <strong>{order.shippingAddress?.fullName}</strong>
                  <span>{order.shippingAddress?.phone}</span>
                  <span>{order.shippingAddress?.addressLine1}</span>

                  {order.shippingAddress?.addressLine2 && (
                    <span>{order.shippingAddress.addressLine2}</span>
                  )}

                  <span>
                    {order.shippingAddress?.city}
                    {order.shippingAddress?.postalCode
                      ? `, ${order.shippingAddress.postalCode}`
                      : ""}
                  </span>
                </address>

                <div className="order-date-block">
                  <span className="order-label">Placed on</span>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default OrderDetails;

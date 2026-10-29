import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

function MyOrders() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const result = await orderHistoryService.getMyOrders(token);

        if (!result?.success || !Array.isArray(result?.data?.orders)) {
          throw new Error("The server returned an unexpected orders response.");
        }

        if (active) {
          setOrders(result.data.orders);
        }
      } catch (requestError) {
        if (!active) return;

        if (requestError.response?.status === 401) {
          logout();
          navigate("/login", {
            replace: true,
            state: { from: "/account/orders" },
          });
          return;
        }

        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "We couldn't load your orders. Please try again.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    if (token) {
      loadOrders();
    } else {
      setLoading(false);
      setError("Please sign in to view your orders.");
    }

    return () => {
      active = false;
    };
  }, [token, logout, navigate]);

  return (
    <section className="page-section">
      <div className="container orders-page">
        <div className="orders-heading">
          <div>
            <p className="eyebrow">Your Lanka Batiks account</p>
            <h1>My Orders</h1>
            <p>View your purchases and track their current status.</p>
          </div>

          <Link className="button button-secondary" to="/account">
            Back to account
          </Link>
        </div>

        {loading && (
          <div className="orders-message">
            <p>Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="orders-message orders-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <h2>You haven't placed any orders yet.</h2>
            <p>Your future purchases will appear here.</p>
            <Link className="button button-primary" to="/products">
              Browse products
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <div className="order-card-header">
                  <div>
                    <span className="order-label">Order number</span>
                    <strong className="order-id">{order._id}</strong>
                  </div>

                  <span
                    className={`order-status order-status-${String(
                      order.status || "pending",
                    ).toLowerCase()}`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>

                <div className="order-card-info">
                  <div>
                    <span className="order-label">Order date</span>
                    <strong>{formatDate(order.createdAt)}</strong>
                  </div>

                  <div>
                    <span className="order-label">Items</span>
                    <strong>
                      {(order.items || []).reduce(
                        (total, item) => total + (Number(item.quantity) || 0),
                        0,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span className="order-label">Total</span>
                    <strong>{formatLKR(order.total)}</strong>
                  </div>
                </div>

                <div className="order-card-footer">
                  <span>
                    Payment: Cash on delivery
                  </span>

                  <Link
                    className="button button-primary"
                    to={`/account/orders/${order._id}`}
                  >
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyOrders;

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import adminDashboardService from "../../services/adminDashboardService.js";
import "./AdminDashboard.css";

const formatLKR = (amount = 0) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  "Unable to load dashboard data. Please try again.";

function AdminDashboard() {
  const { token } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setDashboard(null);
      setError("Please sign in with an administrator account.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await adminDashboardService.getDashboard(token);
      setDashboard(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary = dashboard?.summary;
  const monthlySales = dashboard?.monthlySales ?? [];

  const maxRevenue = Math.max(
    1,
    ...monthlySales.map((month) => month.paidRevenue),
  );

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split("-").map(Number);

    return new Intl.DateTimeFormat("en", {
      month: "short",
    }).format(new Date(Date.UTC(year, month - 1, 15)));
  };

  const statistics = [
    {
      label: "Total orders",
      value: summary?.totalOrders ?? 0,
      icon: "▤",
      description: "All orders placed",
    },
    {
      label: "Pending orders",
      value: summary?.pendingOrders ?? 0,
      icon: "◷",
      description: "Awaiting confirmation",
    },
    {
      label: "Delivered orders",
      value: summary?.deliveredOrders ?? 0,
      icon: "✓",
      description: "Successfully delivered",
    },
    {
      label: "Cancelled orders",
      value: summary?.cancelledOrders ?? 0,
      icon: "×",
      description: "Cancelled orders",
    },
    {
      label: "Collected revenue",
      value: formatLKR(summary?.paidRevenue ?? 0),
      icon: "Rs",
      description: "Payments marked as paid",
      isCurrency: true,
    },
  ];

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div>
          <p className="admin-dashboard__eyebrow">LANKA BATIKS</p>
          <h1>Admin Dashboard</h1>
          <p>Monitor orders and store performance.</p>
        </div>

        <div className="admin-dashboard__actions">
          <Link to="/admin/products" className="admin-dashboard__button">
            Manage products
          </Link>
          <Link
            to="/admin/orders"
            className="admin-dashboard__button admin-dashboard__button--primary"
          >
            Manage orders
          </Link>
        </div>
      </header>

      {loading && (
        <p className="admin-dashboard__message" role="status">
          Loading dashboard...
        </p>
      )}

      {!loading && error && (
        <section className="admin-dashboard__error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={loadDashboard}>
            Try again
          </button>
        </section>
      )}

      {!loading && !error && dashboard && (
        <>
          <section
            className="admin-dashboard__stats"
            aria-label="Store statistics"
          >
            <section
              className="admin-dashboard__sales"
              aria-labelledby="monthly-sales-title"
            >
              <div className="admin-dashboard__section-heading">
                <div>
                  <h2 id="monthly-sales-title">Monthly sales analytics</h2>
                  <p>Paid revenue and order volume over the last 12 months.</p>
                </div>
              </div>

              {monthlySales.length > 0 ? (
                <>
                  <div className="admin-dashboard__chart-legend">
                    <span>
                      <span className="admin-dashboard__legend-dot" />
                      Paid revenue (LKR)
                    </span>
                    <span>Orders are shown below each month</span>
                  </div>

                  <div
                    className="admin-dashboard__chart"
                    role="img"
                    aria-label="Monthly paid revenue chart. Monthly order counts are listed beneath each bar."
                  >
                    {monthlySales.map((month) => {
                      const revenue = Number(month.paidRevenue) || 0;
                      const barHeight = (revenue / maxRevenue) * 100;

                      return (
                        <div
                          className="admin-dashboard__chart-column"
                          key={month.month}
                          title={`${formatMonth(month.month)}: ${formatLKR(revenue)}, ${month.totalOrders} orders`}
                        >
                          <span className="admin-dashboard__chart-value">
                            {revenue > 0 ? formatLKR(revenue) : "—"}
                          </span>

                          <div className="admin-dashboard__bar-area">
                            <div
                              className="admin-dashboard__bar"
                              style={{ height: `${barHeight}%` }}
                            />
                          </div>

                          <span className="admin-dashboard__chart-month">
                            {formatMonth(month.month)}
                          </span>

                          <span className="admin-dashboard__chart-orders">
                            {month.totalOrders} orders
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="admin-dashboard__empty">
                  <h3>No monthly sales data</h3>
                  <p>
                    Monthly analytics will appear when the API returns sales
                    data.
                  </p>
                </div>
              )}
            </section>

            {statistics.map((statistic) => (
              <article
                className="admin-dashboard__stat-card"
                key={statistic.label}
              >
                <div className="admin-dashboard__stat-top">
                  <span
                    className="admin-dashboard__stat-icon"
                    aria-hidden="true"
                  >
                    {statistic.icon}
                  </span>
                  <span>{statistic.label}</span>
                </div>

                <strong
                  className={
                    statistic.isCurrency
                      ? "admin-dashboard__stat-value admin-dashboard__stat-value--currency"
                      : "admin-dashboard__stat-value"
                  }
                >
                  {statistic.value}
                </strong>

                <p>{statistic.description}</p>
              </article>
            ))}
          </section>

          <section className="admin-dashboard__recent">
            <div className="admin-dashboard__section-heading">
              <div>
                <h2>Recent orders</h2>
                <p>The five most recently placed orders.</p>
              </div>
              <Link to="/admin/orders">View all orders</Link>
            </div>

            {dashboard.recentOrders?.length > 0 ? (
              <div className="admin-dashboard__table-wrapper">
                <table className="admin-dashboard__table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Order status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <span className="admin-dashboard__order-id">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="admin-dashboard__customer">
                            <strong>
                              {order.user?.name || "Unknown customer"}
                            </strong>
                            <span>
                              {order.user?.email || "No email available"}
                            </span>
                          </div>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td className="admin-dashboard__total">
                          {formatLKR(order.total)}
                        </td>
                        <td>
                          <span
                            className={`admin-dashboard__status admin-dashboard__status--${order.status}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-dashboard__status admin-dashboard__status--payment-${order.paymentStatus}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-dashboard__empty">
                <h3>No orders yet</h3>
                <p>New customer orders will appear here.</p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default AdminDashboard;

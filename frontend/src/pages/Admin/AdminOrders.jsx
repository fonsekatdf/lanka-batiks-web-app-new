import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext.jsx";
import adminOrderService from "../../services/adminOrderService.js";

import "./AdminOrders.css";

const NEXT_STATUSES = {
  pending: ["confirmed"],
  confirmed: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const formatLKR = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

function AdminOrders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await adminOrderService.getAllOrders(token);

      if (!result?.success || !Array.isArray(result?.data?.orders)) {
        throw new Error("The server returned an unexpected orders response.");
      }

      setOrders(result.data.orders);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      order._id?.toLowerCase().includes(query) ||
      order.user?.name?.toLowerCase().includes(query) ||
      order.user?.email?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  async function handleStatusUpdate(order, nextStatus) {
    if (!nextStatus || nextStatus === order.status) return;

    const confirmed = window.confirm(
      `Change order ${order._id} from "${order.status}" to "${nextStatus}"?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setUpdatingId(order._id);

    try {
      const result = await adminOrderService.updateOrderStatus(
        order._id,
        nextStatus,
        token,
      );

      if (!result?.success || !result?.data?.order) {
        throw new Error("The server did not confirm the status update.");
      }

      setOrders((current) =>
        current.map((item) =>
          item._id === order._id ? result.data.order : item,
        ),
      );

      setSuccess(`Order status updated to "${nextStatus}".`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = orders.filter(
    (order) => order.status === "pending",
  ).length;

  return (
    <section className="admin-orders-page">
      <div className="container admin-orders-container">
        <header className="admin-orders-header">
          <div>
            <p className="admin-orders-eyebrow">
              Lanka Batiks · Administration
            </p>
            <h1>Order Management</h1>
            <p>Review customer orders and manage fulfillment progress.</p>
          </div>

          <div className="admin-orders-stats">
            <div>
              <span>Total orders</span>
              <strong>{orders.length}</strong>
            </div>
            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>
          </div>
        </header>

        {error && (
          <div className="admin-orders-alert admin-orders-alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-orders-alert admin-orders-alert-success" role="status">
            {success}
          </div>
        )}

        <section className="admin-orders-panel">
          <div className="admin-orders-toolbar">
            <label className="admin-orders-search">
              <span>Search orders</span>
              <input
                type="search"
                placeholder="Order ID, customer name, or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="admin-orders-filter">
              <span>Filter by status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>

            <button
              type="button"
              className="admin-orders-button admin-orders-button-secondary"
              onClick={loadOrders}
              disabled={loading || updatingId !== null}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="admin-orders-message">Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-orders-message">
              <h2>No orders found</h2>
              <p>Try changing your search or status filter.</p>
            </div>
          ) : (
            <div className="admin-orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Date</th>
                    <th scope="col">Items</th>
                    <th scope="col">Total</th>
                    <th scope="col">Status</th>
                    <th scope="col">Update status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const nextStatuses =
                      NEXT_STATUSES[order.status] ?? [];

                    return (
                      <tr key={order._id}>
                        <td>
                          <span className="admin-orders-id">
                            {order._id}
                          </span>
                        </td>

                        <td>
                          <div className="admin-orders-customer">
                            <strong>
                              {order.user?.name || "Unknown customer"}
                            </strong>
                            <span>
                              {order.user?.email || "Email unavailable"}
                            </span>
                          </div>
                        </td>

                        <td>{formatDate(order.createdAt)}</td>

                        <td>
                          {(order.items || []).reduce(
                            (total, item) =>
                              total + (Number(item.quantity) || 0),
                            0,
                          )}
                        </td>

                        <td>{formatLKR(order.total)}</td>

                        <td>
                          <span
                            className={`admin-orders-status admin-orders-status-${order.status}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td>
                          {nextStatuses.length > 0 ? (
                            <select
                              aria-label={`Update order ${order._id} status`}
                              value=""
                              disabled={updatingId !== null}
                              onChange={(event) =>
                                handleStatusUpdate(order, event.target.value)
                              }
                            >
                              <option value="">Choose next status</option>
                              {nextStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="admin-orders-final-status">
                              No further transitions
                            </span>
                          )}

                          {updatingId === order._id && (
                            <span className="admin-orders-updating">
                              Updating...
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <p className="admin-orders-count">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

export default AdminOrders;

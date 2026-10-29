import api from "./api.js";

const adminOrderService = {
  async getAllOrders(token) {
    const response = await api.get("/orders/admin/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  async updateOrderStatus(orderId, status, token) {
    const response = await api.patch(
      `/orders/admin/${encodeURIComponent(orderId)}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  },
};

export default adminOrderService;

import api from "./api.js";

const orderHistoryService = {
  async getMyOrders(token) {
    const response = await api.get("/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  async getOrderById(orderId, token) {
    const response = await api.get(
      `/orders/${encodeURIComponent(orderId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  },
};

export default orderHistoryService;

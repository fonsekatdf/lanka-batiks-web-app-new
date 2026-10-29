import api from "../Services/api.js";

const orderService = {
  async createOrder({ items, shippingAddress, token }) {
    if (!token) {
      throw new Error("Please log in before placing your order.");
    }

    const payload = {
      items: items.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentMethod: "cash_on_delivery",
    };

    const response = await api.post("/orders", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};

export default orderService;

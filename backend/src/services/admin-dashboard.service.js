import Order from "../models/order.model.js";

export const getAdminDashboard = async () => {
  const [
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    unpaidOrders,
    paidRevenueResult,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),

    Order.countDocuments({ status: "pending" }),

    Order.countDocuments({ status: "delivered" }),

    Order.countDocuments({ status: "cancelled" }),

    Order.countDocuments({
      paymentStatus: "pending",
    }),

    Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]),

    Order.find()
      .select(
        "user total status paymentStatus paymentMethod createdAt items",
      )
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const paidRevenue = paidRevenueResult[0]?.total ?? 0;

  return {
    summary: {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      unpaidOrders,
      paidRevenue,
    },
    recentOrders,
  };
};

import Order from "../models/order.model.js";

const REPORT_TIME_ZONE = "Asia/Colombo";
const REPORT_MONTHS = 12;
const MINUTES_IN_MILLISECONDS = 60 * 1000;
const COLOMBO_UTC_OFFSET_MINUTES = 330;

const getMonthParts = (date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year").value);
  const month = Number(parts.find((part) => part.type === "month").value);

  return { year, month };
};

const getMonthKey = (year, month) =>
  `${year}-${String(month).padStart(2, "0")}`;

const getColomboMonthStart = (year, month) =>
  new Date(
    Date.UTC(year, month - 1, 1) -
      COLOMBO_UTC_OFFSET_MINUTES * MINUTES_IN_MILLISECONDS,
  );

const buildMonthlySales = (monthlyResults, now = new Date()) => {
  const { year: currentYear, month: currentMonth } = getMonthParts(now);

  const resultsByMonth = new Map(
    monthlyResults.map((result) => [result._id, result]),
  );

  const months = [];

  for (let offset = REPORT_MONTHS - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(currentYear, currentMonth - 1 - offset, 1));

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const key = getMonthKey(year, month);
    const result = resultsByMonth.get(key);

    months.push({
      month: key,
      totalOrders: result?.totalOrders ?? 0,
      paidRevenue: result?.paidRevenue ?? 0,
    });
  }

  return months;
};

export const getAdminDashboard = async () => {
  const now = new Date();
  const { year, month } = getMonthParts(now);

  const firstMonthDate = new Date(
    Date.UTC(year, month - 1 - (REPORT_MONTHS - 1), 1),
  );

  const monthlyStartDate = getColomboMonthStart(
    firstMonthDate.getUTCFullYear(),
    firstMonthDate.getUTCMonth() + 1,
  );
  const [
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    unpaidOrders,
    paidRevenueResult,
    recentOrders,
    monthlyResults,
  ] = await Promise.all([
    Order.countDocuments(),

    Order.countDocuments({ status: "pending" }),

    Order.countDocuments({ status: "delivered" }),

    Order.countDocuments({ status: "cancelled" }),

    Order.countDocuments({ paymentStatus: "pending" }),

    Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
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
      .select("user total status paymentStatus paymentMethod createdAt items")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // Calculate monthly order counts and paid revenue.

    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthlyStartDate },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
              timezone: REPORT_TIME_ZONE,
            },
          },
          totalOrders: { $sum: 1 },
          paidRevenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
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
    monthlySales: buildMonthlySales(monthlyResults, now),
  };
};

import { getAdminDashboard } from "../services/admin-dashboard.service.js";

export const getAdminDashboardController = async (req, res, next) => {
  try {
    const dashboard = await getAdminDashboard();

    return res.status(200).json({
      success: true,
      message: "Admin dashboard data retrieved successfully.",
      data: dashboard,
    });
  } catch (error) {
    return next(error);
  }
};

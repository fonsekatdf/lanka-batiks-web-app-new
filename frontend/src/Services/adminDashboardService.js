import api from "./api.js";

const adminDashboardService = {
  async getDashboard(token) {
    const response = await api.get("/admin/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};

export default adminDashboardService;

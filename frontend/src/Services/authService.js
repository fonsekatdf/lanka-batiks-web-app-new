import api from "../Services/api.js";

const authService = {
  async register({ name, email, password }) {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    return response.data;
  },

  async login({ email, password }) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  },

  async getCurrentUser(token) {
    const response = await api.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },
};

export default authService;

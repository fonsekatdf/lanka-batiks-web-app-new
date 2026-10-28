import api from "./api.js";

export const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return response.data.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data.data;
};

// Attach the logged-in user's JWT to protected requests.
const authConfig = (token) => {
  if (!token) {
    throw new Error("Authentication is required for this operation.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const createProduct = async (productData, token) => {
  const response = await api.post(
    "/products",
    productData,
    authConfig(token),
  );

  return response.data.data;
};

export const updateProduct = async (id, productData, token) => {
  const response = await api.put(
    `/products/${id}`,
    productData,
    authConfig(token),
  );

  return response.data.data;
};

export const deleteProduct = async (id, token) => {
  const response = await api.delete(
    `/products/${id}`,
    authConfig(token),
  );

  return response.data;
};

import Product from "../models/product.model.js";

export const createProduct = async (data) => {
  return Product.create(data);
};

export const getProducts = async (filters = {}) => {
  const query = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.search) {
    query.name = {
      $regex: filters.search,
      $options: "i",
    };
  }

  let productsQuery = Product.find(query);

  if (filters.sort === "price_asc") {
    productsQuery = productsQuery.sort({ price: 1 });
  } else if (filters.sort === "price_desc") {
    productsQuery = productsQuery.sort({ price: -1 });
  } else {
    productsQuery = productsQuery.sort({ createdAt: -1 });
  }

  return productsQuery;
};

export const getProductById = async (id) => {
  return Product.findById(id);
};

export const updateProduct = async (id, data) => {
  return Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
    returnDocument: "after",
  });
};

export const deleteProduct = async (id) => {
  return Product.findByIdAndDelete(id);
};

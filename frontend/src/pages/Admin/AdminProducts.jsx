import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext.jsx";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../../Services/productService.js";

import { Link } from "react-router-dom";

import "./AdminProducts.css";

const CATEGORIES = [
  "Traditional",
  "Clothing",
  "Accessories",
  "Home Decor",
  "Wall Art",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "Traditional",
  images: "",
  stock: "0",
  isFeatured: false,
};

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

function AdminProducts() {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getProducts();
      setProducts(Array.isArray(result) ? result : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();

    return (
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  });

  function handleFieldChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setFormData({ ...EMPTY_FORM });
    setEditingId(null);
  }

  function handleEdit(product) {
    setEditingId(product._id);

    setFormData({
      name: product.name ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      category: product.category ?? "Traditional",
      images: (product.images ?? []).join(", "),
      stock: String(product.stock ?? 0),
      isFeatured: Boolean(product.isFeatured),
    });

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const price = Number(formData.price);
    const stock = Number(formData.stock);

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      setError("Product name must contain at least 3 characters.");
      return;
    }

    if (
      !formData.description.trim() ||
      formData.description.trim().length < 10
    ) {
      setError("Description must contain at least 10 characters.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid non-negative price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    const images = formData.images
      .split(",")
      .map((image) => image.trim())
      .filter(Boolean);

    if (images.length > 10) {
      setError("You can add a maximum of 10 image URLs.");
      return;
    }

    const invalidImage = images.some((image) => {
      try {
        const url = new URL(image);
        return !["http:", "https:"].includes(url.protocol);
      } catch {
        return true;
      }
    });

    if (invalidImage) {
      setError("Each image must be a valid HTTP or HTTPS URL.");
      return;
    }

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      category: formData.category,
      images,
      stock,
      isFeatured: formData.isFeatured,
    };

    setSaving(true);

    try {
      if (editingId) {
        await updateProduct(editingId, productData, token);
        setSuccess("Product updated successfully.");
      } else {
        await createProduct(productData, token);
        setSuccess("Product created successfully.");
      }

      resetForm();
      await loadProducts();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(product._id);

    try {
      await deleteProduct(product._id, token);

      if (editingId === product._id) {
        resetForm();
      }

      setSuccess("Product deleted successfully.");
      await loadProducts();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="admin-products-page">
      <div className="container admin-products-container">
        <header className="admin-products-header">
          <Link className="button button-secondary" to="/admin/orders">
            Manage orders
          </Link>
          <div>
            <p className="admin-eyebrow">Lanka Batiks · Administration</p>
            <h1>Product Management</h1>
            <p>
              Manage your batik collection, prices, availability, and featured
              products.
            </p>
          </div>

          <div className="admin-products-total">
            <span>Total products</span>
            <strong>{products.length}</strong>
          </div>
        </header>

        {error && (
          <div className="admin-alert admin-alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-alert admin-alert-success" role="status">
            {success}
          </div>
        )}

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">
                {editingId ? "Update catalogue" : "Catalogue"}
              </p>
              <h2>{editingId ? "Edit product" : "Add a product"}</h2>
            </div>

            {editingId && (
              <button
                className="admin-button admin-button-secondary"
                type="button"
                onClick={resetForm}
              >
                Cancel editing
              </button>
            )}
          </div>

          <form className="admin-product-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Product name *</span>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleFieldChange}
                  minLength={3}
                  maxLength={120}
                  required
                />
              </label>

              <label className="admin-field">
                <span>Category *</span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFieldChange}
                  required
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span>Price (LKR) *</span>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleFieldChange}
                  required
                />
              </label>

              <label className="admin-field">
                <span>Stock quantity *</span>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={handleFieldChange}
                  required
                />
              </label>

              <label className="admin-field admin-field-full">
                <span>Description *</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFieldChange}
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  required
                />
              </label>

              <label className="admin-field admin-field-full">
                <span>Image URLs</span>
                <textarea
                  name="images"
                  value={formData.images}
                  onChange={handleFieldChange}
                  rows={2}
                  placeholder="https://example.com/batik-1.jpg, https://example.com/batik-2.jpg"
                />
                <small>
                  Enter up to 10 HTTP/HTTPS URLs, separated by commas.
                </small>
              </label>

              <label className="admin-featured-field">
                <input
                  name="isFeatured"
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={handleFieldChange}
                />
                <span>Feature this product on the home page</span>
              </label>
            </div>

            <div className="admin-form-actions">
              <button
                className="admin-button admin-button-primary"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Create product"}
              </button>

              {!editingId && (
                <button
                  className="admin-button admin-button-secondary"
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Clear form
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading admin-catalogue-heading">
            <div>
              <p className="admin-eyebrow">Inventory</p>
              <h2>Product catalogue</h2>
            </div>

            <label className="admin-search">
              <span className="admin-sr-only">
                Search products by name or category
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
              />
            </label>
          </div>

          {loading ? (
            <p className="admin-table-message" role="status">
              Loading products...
            </p>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-table-message">
              <h3>No products found</h3>
              <p>
                {search
                  ? "Try another search term."
                  : "Add your first product using the form above."}
              </p>
            </div>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Category</th>
                    <th scope="col">Price</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Featured</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="admin-product-identity">
                          {product.images?.[0] ? (
                            <img
                              className="admin-product-thumbnail"
                              src={product.images[0]}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="admin-product-thumbnail admin-product-placeholder"
                              aria-hidden="true"
                            >
                              LB
                            </div>
                          )}

                          <span>{product.name}</span>
                        </div>
                      </td>

                      <td>{product.category}</td>

                      <td>
                        {Number(product.price).toLocaleString("en-LK", {
                          style: "currency",
                          currency: "LKR",
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td>
                        <span
                          className={
                            product.stock > 0
                              ? "admin-stock admin-stock-available"
                              : "admin-stock admin-stock-empty"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td>{product.isFeatured ? "Yes" : "No"}</td>

                      <td>
                        <div className="admin-row-actions">
                          <button
                            className="admin-button admin-button-secondary"
                            type="button"
                            onClick={() => handleEdit(product)}
                            disabled={saving || deletingId !== null}
                          >
                            Edit
                          </button>

                          <button
                            className="admin-button admin-button-danger"
                            type="button"
                            onClick={() => handleDelete(product)}
                            disabled={saving || deletingId !== null}
                          >
                            {deletingId === product._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && products.length > 0 && (
            <p className="admin-catalogue-count">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

export default AdminProducts;

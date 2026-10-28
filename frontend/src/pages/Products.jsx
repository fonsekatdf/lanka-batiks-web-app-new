import { useEffect, useState } from "react";
import { getProducts } from "../Services/productService.js";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const result = await getProducts();

        if (active) {
          setProducts(result);
        }
      } catch {
        if (active) {
          setError(
            "Unable to load products. Please try again later."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="container page-section">
      <h1>Our Batik Collection</h1>

      {loading && <p>Loading products...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>No products are available yet.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <ul className="product-list">
          {products.map((product) => (
            <li key={product._id}>
              <strong>{product.name}</strong>
              {" — "}
              LKR {Number(product.price).toLocaleString("en-LK")}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Products;

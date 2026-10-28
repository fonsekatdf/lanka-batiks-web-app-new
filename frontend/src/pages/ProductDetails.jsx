import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getProductById } from "../Services/productService.js";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        const result = await getProductById(id);

        if (active) {
          setProduct(result);
        }
      } catch {
        if (active) {
          setError("Unable to find this product.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <section className="container page-section">Loading product...</section>;
  }

  if (error || !product) {
    return (
      <section className="container page-section">
        <p role="alert">{error || "Product not found."}</p>
      </section>
    );
  }

  return (
    <section className="container page-section">
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Category: {product.category}</p>
      <p>Price: LKR {Number(product.price).toLocaleString("en-LK")}</p>
      <p>Available stock: {product.stock}</p>
    </section>
  );
}

export default ProductDetails;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getProductById } from "../Services/productService.js";
import useCart from "../hooks/useCart.js";

import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart, formatLKR } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);

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

  const handleAddToCart = () => {
    const result = addToCart(product);
    setCartMessage(result.message);
  };

  if (loading) {
    return (
      <section className="container page-section">
        <p>Loading product...</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="container page-section">
        <p role="alert">{error || "Product not found."}</p>
      </section>
    );
  }

  const isOutOfStock = !product.stock || product.stock <= 0;
  const imageUrl = product.images?.find(
    (image) => typeof image === "string" && image.trim(),
  );

  return (
    <section className="container page-section product-details">
      <div className="product-details-image">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} />
        ) : (
          <div className="product-details-image-placeholder">
            <span>Lanka Batiks</span>
            <span aria-hidden="true">✳</span>
          </div>
        )}
      </div>

      <div className="product-details-content">
        <p className="eyebrow">{product.category}</p>

        <h1>{product.name}</h1>

        <p className="product-details-description">{product.description}</p>

        <p className="product-details-price">
          {formatLKR(Number(product.price))}
        </p>

        <p className="product-details-stock">
          Available stock: {product.stock}
        </p>

        <button
          type="button"
          className="button button-primary"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? "Sold Out" : "Add to Cart"}
        </button>

        {cartMessage && (
          <p role="status" className="cart-action-message">
            {cartMessage}
          </p>
        )}
      </div>
    </section>
  );
}

export default ProductDetails;

import { Link } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ product }) {
  const imageUrl = product.images?.find(
    (image) => typeof image === "string" && image.trim()
  );

  return (
    <article className="product-card">
      <Link
        to={`/products/${product._id}`}
        className="product-card-image-link"
        aria-label={`View ${product.name}`}
      >
        <div className="product-card-image">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
            />
          ) : (
            <div className="product-image-placeholder">
              <span>Lanka Batiks</span>
              <span aria-hidden="true">✳</span>
            </div>
          )}

          {product.isFeatured && (
            <span className="product-badge">Featured</span>
          )}
        </div>
      </Link>

      <div className="product-card-content">
        <p className="product-category">{product.category}</p>

        <h3 className="product-name">
          <Link to={`/products/${product._id}`}>
            {product.name}
          </Link>
        </h3>

        <div className="product-card-bottom">
          <p className="product-price">
            LKR {Number(product.price).toLocaleString("en-LK")}
          </p>

          <span
            className={
              product.stock > 0
                ? "product-stock in-stock"
                : "product-stock out-of-stock"
            }
          >
            {product.stock > 0 ? "In stock" : "Sold out"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;

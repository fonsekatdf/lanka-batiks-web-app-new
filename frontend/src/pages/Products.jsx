import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard.jsx";
import { getProducts } from "../Services/productService.js";
import "./Products.css";

const CATEGORIES = [
  "Traditional",
  "Clothing",
  "Accessories",
  "Home Decor",
  "Wall Art",
];

function Products() {
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Debounce search so we don't request the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const result = await getProducts({
          ...(search && { search }),
          ...(category && { category }),
          ...(sort && { sort }),
        });

        if (active) {
          setProducts(result);
        }
      } catch {
        if (active) {
          setError(
            "We couldn't load the collection. Please check your connection and try again.",
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
  }, [search, category, sort, retryCount]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setSort("");
  };

  return (
    <section className="container catalogue-page">
      <div className="catalogue-heading">
        <p className="eyebrow">The Lanka Batiks collection</p>
        <h1>Find your piece of Sri Lanka</h1>
        <p>
          Explore handcrafted designs inspired by our island's colours, culture
          and traditions.
        </p>
      </div>

      <div className="catalogue-toolbar">
        <label className="catalogue-search">
          <span>Search designs</span>
          <input
            type="search"
            placeholder="Try peacock, floral, clothing..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </label>

        <label className="catalogue-filter">
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="catalogue-filter">
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </label>
      </div>

      <div className="catalogue-results">
        <p>
          {loading
            ? "Finding your designs..."
            : `${products.length} ${products.length === 1 ? "design" : "designs"} found`}
        </p>

        {(searchInput || category || sort) && (
          <button
            type="button"
            className="clear-filters"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="catalogue-message error-message" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {!error && loading && (
        <div className="catalogue-message" role="status">
          Loading the collection...
        </div>
      )}

      {!error && !loading && products.length === 0 && (
        <div className="catalogue-message">
          <h2>No designs found</h2>
          <p>Try a different search term or category.</p>
          <button
            type="button"
            className="clear-filters"
            onClick={clearFilters}
          >
            Show all designs
          </button>
        </div>
      )}

      {!error && !loading && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Products;

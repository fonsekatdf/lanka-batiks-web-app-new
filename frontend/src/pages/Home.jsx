import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../components/ProductCard.jsx";
import { getProducts } from "../Services/productService.js";

import "./Home.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadFeaturedProducts() {
      try {
        const result = await getProducts();

        if (active) {
          const featured = result.filter((product) => product.isFeatured);
          setProducts((featured.length > 0 ? featured : result).slice(0, 4));
        }
      } catch {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFeaturedProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-copy">
            <p className="eyebrow">Crafted in Sri Lanka</p>

            <h1>
              A little piece of our island,
              <span> made to be yours.</span>
            </h1>

            <p className="home-hero-description">
              Discover the timeless beauty of batik through
              handcrafted designs, expressive patterns and the
              rich colours of Sri Lankan artistry.
            </p>

            <div className="home-hero-actions">
              <Link to="/products" className="button button-primary">
                Explore the collection
              </Link>

              <a href="#our-story" className="text-link">
                Discover our craft →
              </a>
            </div>

            <p className="home-hero-note">
              Artful patterns. Island heritage. Everyday beauty.
            </p>
          </div>

          <div
            className="home-hero-art"
            role="img"
            aria-label="Decorative batik-inspired pattern"
          >
            <div className="hero-art-frame">
              <div className="hero-art-inner">
                <span className="hero-art-star">✳</span>
                <span className="hero-art-title">LANKA</span>
                <span className="hero-art-subtitle">BATIKS</span>
                <span className="hero-art-star">✳</span>
              </div>
            </div>

            <span className="hero-art-caption">
              Inspired by the island
            </span>
          </div>
        </div>
      </section>

      <section className="container home-collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected for you</p>
            <h2>Discover our collection</h2>
            <p>
              Thoughtful designs with character, colour and a
              connection to our heritage.
            </p>
          </div>

          <Link to="/products" className="text-link">
            View all products →
          </Link>
        </div>

        {loading && (
          <p className="home-status" role="status">
            Discovering our collection...
          </p>
        )}

        {error && (
          <p className="home-status" role="alert">
            Our collection couldn't be loaded right now. Please
            visit the shop to try again.
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="home-empty-state">
            <h3>Our collection is taking shape.</h3>
            <p>New batik designs will appear here soon.</p>
            <Link to="/products" className="text-link">
              Explore the shop →
            </Link>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="product-grid home-product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section id="our-story" className="home-story">
        <div className="container home-story-inner">
          <p className="eyebrow">Our inspiration</p>
          <h2>Tradition, expressed in every pattern.</h2>
          <p>
            Lanka Batiks celebrates the colours, motifs and creative
            spirit of Sri Lankan batik. Every design tells a story
            through pattern, texture and imagination.
          </p>
          <Link to="/products" className="button button-outline">
            Find your favourite design
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;

import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="container page-section">
      <p className="eyebrow">Made with Sri Lankan heritage</p>

      <h1>Discover the art of Lanka Batiks</h1>

      <p className="page-description">
        Explore handcrafted batik designs inspired by the colours,
        patterns and traditions of Sri Lanka.
      </p>

      <Link to="/products" className="button button-primary">
        Explore the collection
      </Link>
    </section>
  );
}

export default Home;

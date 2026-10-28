import { Link } from "react-router-dom";

function NotFound() {
  return (
    <section className="container page-section">
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Return home</Link>
    </section>
  );
}

export default NotFound;

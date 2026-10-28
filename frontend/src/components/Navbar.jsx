import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="site-header">
      <div className="container navbar">
        <Link to="/" className="brand">
          Lanka <span>Batiks</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/products">
            Shop
          </NavLink>

          <NavLink to="/cart">
            Cart
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;

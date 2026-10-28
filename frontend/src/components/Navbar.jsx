import { Link, NavLink } from "react-router-dom";
import useCart from "../hooks/useCart.js";

function Navbar() {
  const { cartCount } = useCart();

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

          <NavLink to="/cart" className="cart-nav-link">
            Cart
            <span className="cart-count-badge" aria-label={`${cartCount} items in cart`}>
              {cartCount}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;

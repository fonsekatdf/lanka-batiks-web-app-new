import { Link, NavLink, useNavigate } from "react-router-dom";

import useCart from "../hooks/useCart.js";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

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
            <span
              className="cart-count-badge"
              aria-label={`${cartCount} items in cart`}
            >
              {cartCount}
            </span>
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/account">
                {user?.name ? `Hi, ${user.name}` : "My Account"}
              </NavLink>

              <button
                type="button"
                className="nav-logout-button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="nav-register-link">
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;

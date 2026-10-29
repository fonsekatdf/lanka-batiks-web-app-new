import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import "./Account.css";

function Account() {
  const { user, logout, refreshCurrentUser } = useAuth();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        await refreshCurrentUser();
      } catch (err) {
        if (!active) return;

        const status = err.response?.status;

        if (status === 401) {
          logout();
          setError("Your session has expired. Please sign in again.");
        } else {
          setError(
            err.response?.data?.message ||
              "We couldn't load your profile. Please try again.",
          );
        }
      } finally {
        if (active) setLoadingProfile(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [refreshCurrentUser, logout]);

  if (loadingProfile) {
    return (
      <section className="page-section">
        <div className="container account-card">
          <p>Loading your account...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-section">
        <div className="container account-card">
          <h1>Account unavailable</h1>
          <p className="account-message" role="alert">
            {error}
          </p>
          <Link className="button button-primary" to="/login">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container account-card">
        <p className="eyebrow">Your Lanka Batiks account</p>
        <h1>My Account</h1>
        <p className="account-intro">Welcome back, {user?.name}.</p>

        <div className="account-details">
          <div className="account-detail">
            <span>Full name</span>
            <strong>{user?.name}</strong>
          </div>

          <div className="account-detail">
            <span>Email address</span>
            <strong>{user?.email}</strong>
          </div>

          <div className="account-detail">
            <span>Account type</span>
            <strong>{user?.role}</strong>
          </div>
        </div>

        <p className="account-note">
          Your profile is retrieved from the authenticated backend endpoint.
        </p>
        <Link className="button button-secondary" to="/account/orders">
          My Orders
        </Link>

        <button
          type="button"
          className="button button-primary"
          onClick={logout}
        >
          Log out
        </button>
      </div>
    </section>
  );
}

export default Account;

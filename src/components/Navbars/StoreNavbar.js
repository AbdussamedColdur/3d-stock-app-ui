import React from "react";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import useCart from "hooks/useCart";
import { getStoredProfile, hasRole, isAuthenticated, logout } from "services/authService";

export default function StoreNavbar({ onCartClick }) {
  const { cartCount } = useCart();
  const authenticated = isAuthenticated();
  const isAdmin = hasRole("ROLE_ADMIN");
  const profile = getStoredProfile();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        .admin-portal-link {
          color: #0F172A !important;
          background-color: rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.06);
          transition: all 0.3s ease;
        }
        .admin-portal-link:hover {
          background-color: #6366F1 !important;
          color: #fff !important;
          border-color: #6366F1 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .auth-link {
          text-decoration: none;
          font-size: 0.85em;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
        }
        .auth-link-login {
          color: #0f172a;
          background: rgba(15, 23, 42, 0.04);
          border: 1px solid rgba(15, 23, 42, 0.08);
        }
        .auth-link-register {
          color: #fff;
          background: #0ea5e9;
          border: 1px solid #0ea5e9;
          box-shadow: 0 8px 20px rgba(14, 165, 233, 0.25);
        }
        .auth-link-logout {
          color: #b91c1c;
          background: rgba(185, 28, 28, 0.06);
          border: 1px solid rgba(185, 28, 28, 0.12);
        }
        .auth-link:hover {
          transform: translateY(-2px);
        }
        .cart-icon-wrapper {
          position: relative;
          cursor: pointer;
          color: #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          width: 45px;
          height: 45px;
          border-radius: 50%;
        }
        .cart-icon-wrapper:hover {
          background: rgba(0,0,0,0.08);
          transform: scale(1.1);
        }
        .cart-badge {
          position: absolute;
          top: 0;
          right: 0;
          transform: translate(25%, -25%);
          background-color: #ff4a55;
          color: #fff;
          font-size: 11px;
          font-weight: 900;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          z-index: 2;
        }
      `}</style>
      <nav
      style={{
        background: "rgba(255, 255, 255, 0.8)", // Beyaz şeffaf
        backdropFilter: "blur(15px)", // Cam efekti
        padding: "16px 0",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
      }}
    >
      <Container>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo Part */}
          <Link 
              to="/"
              style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px", 
                  textDecoration: "none", 
                  color: "#0F172A" 
              }}
          >
            <i
              className="nc-icon nc-cart-simple"
              style={{ 
                  fontSize: "1.8em", 
                  color: "#1dc7ea",
                  textShadow: "0 0 10px rgba(29, 199, 234, 0.5)"
              }}
            ></i>
            <h3
              style={{
                margin: 0,
                color: "#0F172A",
                fontWeight: 900,
                fontSize: "1.5em",
                letterSpacing: "-0.5px",
                textTransform: "uppercase"
              }}
            >
              MAĞAZA
            </h3>
          </Link>

          {/* Right Side Tools */}
          <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
            {authenticated && (
              <>
                <div style={{ color: "#475569", fontWeight: 700, fontSize: "0.85em" }}>
                  {profile && profile.username ? `Merhaba, ${profile.username}` : "Hesabim"}
                </div>
                <Link
                  to="/orders"
                  style={{
                    textDecoration: "none",
                    fontSize: "0.8em",
                    fontWeight: 700,
                    color: "#0F172A",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Siparislerim
                </Link>
              </>
            )}
            {/* Cart Icon with Live Badge */}
            <div 
              className="cart-icon-wrapper"
              onClick={onCartClick}
            >
               <i className="fas fa-shopping-basket" style={{ fontSize: "1.2em", margin: 0 }}></i>
               {cartCount > 0 && (
                 <span className="cart-badge">
                    {cartCount}
                 </span>
               )}
            </div>

            {!authenticated && (
              <>
                <Link to="/login" className="auth-link auth-link-login">
                  <i className="fas fa-sign-in-alt" style={{ fontSize: "0.85em" }}></i>
                  Giris Yap
                </Link>
                <Link to="/register" className="auth-link auth-link-register">
                  <i className="fas fa-user-plus" style={{ fontSize: "0.85em" }}></i>
                  Kayit Ol
                </Link>
              </>
            )}

            {authenticated && isAdmin && (
              <Link to="/admin/dashboard" className="admin-portal-link auth-link">
                <i className="fas fa-lock" style={{ fontSize: "0.85em" }}></i>
                Admin Paneli
              </Link>
            )}

            {authenticated && (
              <button type="button" className="auth-link auth-link-logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt" style={{ fontSize: "0.85em" }}></i>
                Cikis
              </button>
            )}
          </div>
        </div>
      </Container>
    </nav>
  </>
  );
}

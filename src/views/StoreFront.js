import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Alert, Container, Row, Col, Form, Badge, Button, Card, Spinner } from "react-bootstrap";
import useProducts from "hooks/useProducts";
import useCart from "hooks/useCart";
import StoreNavbar from "components/Navbars/StoreNavbar";
import CartDrawer from "components/Products/CartDrawer";
import { getPrimaryCategoryName, getPrimaryImage } from "utils/productModel";

function StoreFront() {
  const history = useHistory();
  const {
    products,
    categories,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
  } = useProducts();

  const { addToCart } = useCart();
  const [showCart, setShowCart] = useState(false);

  const formatPrice = (price) => {
    return "₺" + price.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
  };

  const activeProducts = products.filter((p) => p.status === "active");

  return (
    <>
      <style>{`
        .product-card-container {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          height: 400px;
        }

        .product-image-box {
          width: 100%;
          height: 100%;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform: scale(1);
        }

        .product-card-container:hover .product-image-box {
          transform: scale(1.1);
          filter: blur(12px) brightness(0.7);
        }

        .product-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(0px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 30px;
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          color: #fff;
          text-align: center;
          z-index: 2;
        }

        .product-card-container:hover .product-hover-overlay {
          opacity: 1;
          backdrop-filter: blur(4px);
          background: rgba(15, 23, 42, 0.6);
        }

        .product-info-slide {
          transform: translateY(20px);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }

        .product-card-container:hover .product-info-slide {
          transform: translateY(0);
        }

        .quick-add-btn:hover {
          background: #fff;
          color: #6366F1;
          transform: scale(1.1);
        }

        .filter-sidebar {
          background: #fff;
          border-radius: 24px;
          padding: 30px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
          position: sticky;
          top: 100px;
          z-index: 10;
        }

        .filter-group {
          margin-bottom: 35px;
        }

        .filter-title {
          font-weight: 800;
          font-size: 0.9em;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #0F172A;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .price-input {
          background: #F8FAFC !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
          border-radius: 12px !important;
          padding: 12px 15px !important;
          font-size: 0.9em !important;
          font-weight: 600 !important;
        }

        .price-input:focus {
          border-color: #6366F1 !important;
          box-shadow: none !important;
        }
      `}</style>
      <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)", // Açık Arkaplan
      color: "#0F172A",
      fontFamily: "'Inter', sans-serif"
    }}>
      <StoreNavbar onCartClick={() => setShowCart(true)} />
      <CartDrawer show={showCart} onHide={() => setShowCart(false)} />

      {/* Hero Section - Glassmorphism */}
      <div
        style={{
          padding: "80px 0 60px",
          textAlign: "center",
          background: "radial-gradient(circle at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%)",
        }}
      >
        <Container>
          <h1
            style={{
              fontWeight: 900,
              fontSize: "3.5em",
              marginBottom: "16px",
              letterSpacing: "-2px",
              background: "linear-gradient(to right, #0F172A 30%, #6366F1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            YENİ NESİL ALIŞVERİŞ
          </h1>
          <p
            style={{
              fontSize: "1.3em",
              opacity: 0.7,
              maxWidth: "600px",
              margin: "0 auto",
              fontWeight: 400,
              letterSpacing: "0.5px"
            }}
          >
            En seçkin ürünler, premium deneyim ile kapınızda.
          </p>
        </Container>
      </div>

      {/* Category Filters - Glassmorphism */}
      <Container style={{ marginBottom: "50px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "rgba(0,0,0,0.02)",
            padding: "12px 15px",
            borderRadius: "30px",
            border: "1px solid rgba(0,0,0,0.05)",
            maxWidth: "fit-content",
            margin: "0 auto"
          }}
        >
          <button
            onClick={() => setCategoryFilter("all")}
            style={{
              borderRadius: "15px",
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: "0.85em",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor: categoryFilter === "all" ? "#6366F1" : "transparent",
              color: categoryFilter === "all" ? "#fff" : "rgba(15,23,42,0.6)",
              boxShadow: categoryFilter === "all" ? "0 8px 20px rgba(99, 102, 241, 0.4)" : "none",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}
          >
            Hepsi
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                borderRadius: "15px",
                padding: "10px 24px",
                fontWeight: 700,
                fontSize: "0.85em",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                backgroundColor: categoryFilter === cat ? "#6366F1" : "transparent",
                color: categoryFilter === cat ? "#fff" : "rgba(15,23,42,0.6)",
                boxShadow: categoryFilter === cat ? "0 8px 20px rgba(99, 102, 241, 0.4)" : "none",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </Container>

      {/* Product List Section with Sidebar */}
      <Container fluid className="px-5" style={{ paddingBottom: "100px" }}>
        <Row>
          {/* Filter Sidebar */}
          <Col lg={2} md={3} className="d-none d-md-block">
            <div className="filter-sidebar">
              <div className="filter-group">
                <div className="filter-title">
                  <i className="fas fa-search" style={{ color: "#6366F1" }}></i>
                  ARAMA
                </div>
                <Form.Control
                  placeholder="Ürün adı yazın..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="price-input"
                />
              </div>

              <div className="filter-group">
                <div className="filter-title">
                  <i className="fas fa-tags" style={{ color: "#6366F1" }}></i>
                  FİYAT ARALIĞI
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Form.Control
                    placeholder="Min ₺"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="price-input"
                  />
                  <div style={{ opacity: 0.3 }}>-</div>
                  <Form.Control
                    placeholder="Max ₺"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>

              <Button
                variant="link"
                className="w-100 mt-2"
                style={{ color: "rgba(15,23,42,0.4)", textDecoration: "none", fontWeight: 700, fontSize: "0.8em" }}
                onClick={() => {
                  setSearchTerm("");
                  setMinPrice("");
                  setMaxPrice("");
                  setCategoryFilter("all");
                }}
              >
                FİLTRELERİ TEMİZLE
              </Button>
            </div>
          </Col>

          {/* Product Grid */}
          <Col lg={10} md={9} sm={12}>
            {error ? (
              <Alert variant="danger">{error}</Alert>
            ) : loading ? (
              <div style={{ textAlign: "center", padding: "100px 20px" }}>
                <Spinner animation="border" variant="info" />
              </div>
            ) : activeProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "100px 20px", opacity: 0.3 }}>
                <i className="nc-icon nc-cart-simple" style={{ fontSize: "5em", display: "block", marginBottom: "20px" }}></i>
                <h4 style={{ fontWeight: 800 }}>ARADĞINIZ ÜRÜN BULUNAMADI</h4>
              </div>
            ) : (
              <Row>
                {activeProducts.map((product) => (
                  <Col lg="6" xl="4" md="12" sm="12" key={product.id} style={{ marginBottom: "40px" }}>
                    <div 
                      className="product-card-container"
                      onClick={() => history.push(`/product/${product.id}`)}
                    >
                      {/* Base Image State */}
                      <div className="product-image-box">
                        {getPrimaryImage(product) ? (
                          <img 
                            src={getPrimaryImage(product)} 
                            alt={product.name} 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          />
                        ) : (
                          <div style={{ 
                            width: "100%", 
                            height: "100%", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)"
                          }}>
                            <i className="nc-icon nc-album-2" style={{ fontSize: "5em", opacity: 0.1 }}></i>
                          </div>
                        )}
                      </div>

                      {/* Hover Overlay State */}
                      <div className="product-hover-overlay">
                        <div className="product-info-slide">
                          <Badge 
                            bg="transparent" 
                            style={{ border: "1px solid rgba(255,255,255,0.4)", borderRadius: "10px", fontSize: "0.7em", color: "#fff", fontWeight: 700, marginBottom: "15px" }}
                          >
                            {getPrimaryCategoryName(product)}
                          </Badge>
                          <h4 style={{ fontWeight: 900, marginBottom: "10px", fontSize: "1.4em", color: "#fff" }}>
                            {product.name}
                          </h4>
                          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85em", lineHeight: 1.5, marginBottom: "25px", height: "45px", overflow: "hidden" }}>
                            {product.description}
                          </p>
                          <div style={{ fontSize: "1.8em", fontWeight: 900, color: "#fff", marginBottom: "20px" }}>
                            {formatPrice(product.price)}
                          </div>
                          <Button 
                            variant="outline-light" 
                            style={{ border: "2px solid #fff", borderRadius: "12px", padding: "10px 30px", fontWeight: 800, textTransform: "uppercase", fontSize: "0.8em", letterSpacing: "1px" }}
                            onClick={() => history.push(`/product/${product.id}`)}
                          >
                            İncele
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer style={{ 
          backgroundColor: "#F8FAFC", 
          color: "rgba(15,23,42,0.3)", 
          padding: "60px 0", 
          textAlign: "center",
          borderTop: "1px solid rgba(0,0,0,0.05)" 
      }}>
        <Container>
          <div className="mb-4">
              <i className="nc-icon nc-cart-simple" style={{ fontSize: "2.5em" }}></i>
          </div>
          <p style={{ margin: 0, fontSize: "0.9em", letterSpacing: "1px", fontWeight: 600 }}>
            © {new Date().getFullYear()} MAĞAZA PREMIUM. TÜM HAKLARI SAKLIDIR.
          </p>
        </Container>
      </footer>
    </div>
  </>
  );
}

export default StoreFront;

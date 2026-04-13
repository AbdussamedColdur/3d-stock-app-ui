import React, { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Alert, Container, Row, Col, Badge, Button, Card, Carousel, Spinner } from "react-bootstrap";
import useCart from "hooks/useCart";
import StoreNavbar from "components/Navbars/StoreNavbar";
import CartDrawer from "components/Products/CartDrawer";
import { getPrimaryCategoryName } from "utils/productModel";
import { getProductById } from "services/productService";

function ProductDetail() {
  const { id } = useParams();
  const history = useHistory();
  const { addToCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProductById(id);
        if (isMounted) {
          setProduct(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err && err.message ? err.message : "Urun detayi alinamadi.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const primaryCategory = getPrimaryCategoryName(product);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner animation="border" variant="info" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Container style={{ maxWidth: "700px" }}>
          <Alert variant="danger" className="text-center mb-0">{error}</Alert>
        </Container>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Container className="text-center">
            <h3>Ürün bulunamadı.</h3>
            <Button variant="info" className="mt-4" onClick={() => history.push("/")}>
              Mağazaya Dön
            </Button>
          </Container>
      </div>
    );
  }

  const formatPrice = (price) => {
    return "₺" + price.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
  };

  const categoryColors = {
    Elektronik: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    Giyim: "linear-gradient(135deg, #db2777, #9333ea)",
    Gıda: "linear-gradient(135deg, #059669, #10b981)",
    Spor: "linear-gradient(135deg, #ea580c, #f59e0b)",
    "Ev & Yaşam": "linear-gradient(135deg, #2563eb, #0891b2)",
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)", // Açık Arkaplan
      color: "#0F172A",
      fontFamily: "'Inter', sans-serif"
    }}>
      <style>{`
        /* Carousel Controls Visibility - High Contrast */
        .carousel-control-prev-icon,
        .carousel-control-next-icon {
          background-color: #6366F1 !important; /* Solid Indigo */
          border-radius: 50%;
          background-size: 50%;
          width: 48px;
          height: 48px;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
          transition: all 0.3s ease;
        }

        .carousel-control-prev span:not(.carousel-control-prev-icon),
        .carousel-control-next span:not(.carousel-control-next-icon) {
          display: none !important;
        }

        .carousel-control-prev:hover .carousel-control-prev-icon,
        .carousel-control-next:hover .carousel-control-next-icon {
          background-color: #4F46E5 !important;
          transform: scale(1.1);
        }

        .carousel-indicators [data-bs-target],
        .carousel-indicators li {
          background-color: #6366F1 !important;
          height: 8px;
          width: 8px;
          border-radius: 50%;
          margin: 0 6px;
          opacity: 0.2;
          border: none;
          transition: all 0.3s ease;
        }

        .carousel-indicators .active {
          opacity: 1;
          width: 24px; /* Long indicator for active state */
          border-radius: 4px;
        }

        .carousel-inactive {
          display: block !important;
        }

        .carousel-inactive .carousel-control-prev,
        .carousel-inactive .carousel-control-next,
        .carousel-inactive .carousel-indicators {
          pointer-events: none;
          opacity: 0.25 !important; /* Slightly more visible but clearly inactive */
        }
        
        .detail-card {
           border: 1px solid rgba(0,0,0,0.05) !important;
           border-radius: 32px !important;
           background-color: #fff !important;
           box-shadow: 0 15px 45px rgba(0,0,0,0.03) !important;
           overflow: hidden;
           height: 100%;
        }
      `}</style>
      <StoreNavbar onCartClick={() => setShowCart(true)} />
      <CartDrawer show={showCart} onHide={() => setShowCart(false)} />

      <Container className="py-5" style={{ marginTop: "40px" }}>
        <Row className="justify-content-center g-4">
          <Col lg={7}>
            <Card className="detail-card">
              <div
                    style={{
                      height: "100%",
                      minHeight: "600px",
                      background: !product.images || product.images.length === 0 ? (categoryColors[primaryCategory] || "#eee") : "#f8fafc",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                  <Carousel 
                    style={{ height: "100%" }}
                    indicators={true}
                    controls={true}
                    interval={product.images && product.images.length > 1 ? 5000 : null}
                    className={(product.images && product.images.length > 1) ? "" : "carousel-inactive"}
                    slide={false}
                  >
                    {product.images && product.images.length > 0 ? (
                      product.images.map((img, idx) => (
                        <Carousel.Item key={idx} style={{ height: "600px" }}>
                          <img
                            className="d-block w-100"
                            src={img.imageUrl}
                            alt={img.altText || `Product slide ${idx}`}
                            style={{ 
                              height: "600px", 
                              objectFit: "cover",
                            }}
                          />
                        </Carousel.Item>
                      ))
                    ) : (
                      <Carousel.Item style={{ height: "600px" }}>
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#fff",
                            padding: "60px",
                            background: categoryColors[primaryCategory] || "#eee",
                          }}
                        >
                          <i className="nc-icon nc-album-2" style={{ fontSize: "10em", opacity: 0.2 }}></i>
                        </div>
                      </Carousel.Item>
                    )}
                  </Carousel>
                  </div>
            </Card>
          </Col>
          <Col lg={4} md={5}>
            <Card className="detail-card">
              <Card.Body className="p-4 d-flex flex-column h-100" style={{ padding: "40px !important" }}>
                    <div className="mb-auto">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                           <Badge 
                                variant={product.status === "active" ? "success" : "secondary"}
                                style={{ borderRadius: "8px", padding: "6px 12px", fontWeight: 700, letterSpacing: "1px" }}
                            >
                                {product.status === "active" ? "AKTiF" : "PASiF"}
                            </Badge>
                            <span style={{ fontSize: "0.85em", opacity: 0.5, fontWeight: 600 }}>ID: #{product.id}</span>
                        </div>

                        <h1 style={{ fontWeight: 900, color: "#0F172A", marginBottom: "20px", fontSize: "2.2em", letterSpacing: "-1px" }}>
                            {product.name}
                        </h1>
                        
                        <div className="mb-4 d-flex align-items-baseline gap-2">
                            <span style={{ fontSize: "2em", fontWeight: 900, color: "#6366F1", letterSpacing: "-1px" }}>
                                {formatPrice(product.price)}
                            </span>
                        </div>
                        
                        <div style={{ marginBottom: "30px" }}>
                            <h5 style={{ fontWeight: 800, color: "rgba(15,23,42,0.6)", marginBottom: "12px", textTransform: "uppercase", fontSize: "0.8em", letterSpacing: "1px" }}>
                                ÜRÜN AÇIKLAMASI
                            </h5>
                            <p style={{ color: "rgba(15,23,42,0.5)", lineHeight: "1.8", fontSize: "1em", fontWeight: 400 }}>
                                {product.description}
                            </p>
                        </div>
                        
                        <div className="d-flex align-items-center mb-4 p-3" style={{ background: "rgba(0,0,0,0.02)", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                            <div style={{ 
                                width: "10px", 
                                height: "10px", 
                                borderRadius: "50%", 
                                backgroundColor: product.stock > 0 ? "#10B981" : "#F43F5E", 
                                marginRight: "12px",
                                boxShadow: `0 0 15px ${product.stock > 0 ? "rgba(16, 185, 129, 0.4)" : "rgba(244, 63, 94, 0.4)"}` 
                            }}></div>
                            <span style={{ fontWeight: 700, fontSize: "0.9em", color: "#0F172A" }}>
                                {product.stock > 0 ? `STOKTA MEVCUT (${product.stock} ADET)` : "STOKTA TÜKENDİ"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-5">
                        <Button 
                            className="btn-fill w-100 py-3" 
                            variant="info" 
                            disabled={product.stock === 0}
                            onClick={() => addToCart(product)}
                            style={{ 
                                fontWeight: 900, 
                                fontSize: "1.1em",
                                borderRadius: "16px",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                backgroundColor: "#6366F1",
                                border: "none",
                                boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)",
                                transition: "all 0.3s ease"
                            }}
                        >
                            {product.stock > 0 ? "SEPETE EKLE" : "STOKTA YOK"}
                        </Button>
                        <Button 
                            variant="link" 
                            className="w-100 mt-3" 
                            style={{ color: "rgba(15,23,42,0.3)", textDecoration: "none", fontWeight: 700, letterSpacing: "1px" }}
                            onClick={() => history.push("/")}
                        >
                            <i className="fas fa-chevron-left mr-2"></i> ALIŞVERİŞE DEVAM ET
                        </Button>
                    </div>
                  </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ProductDetail;

import React from "react";
import { Alert, Badge, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { getMyOrders } from "services/orderService";
import StoreNavbar from "components/Navbars/StoreNavbar";
import CartDrawer from "components/Products/CartDrawer";

function MyOrders() {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [showCart, setShowCart] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getMyOrders();
        if (active) {
          setOrders(response);
        }
      } catch (err) {
        if (active) {
          setError(err && err.message ? err.message : "Siparisler alinamadi.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrders();
    return () => {
      active = false;
    };
  }, []);

  const formatPrice = (price) =>
    "₺" + Number(price || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)" }}>
      <StoreNavbar onCartClick={() => setShowCart(true)} />
      <CartDrawer show={showCart} onHide={() => setShowCart(false)} />
      <Container className="py-5">
        <div className="mb-4">
          <h2 style={{ fontWeight: 800, color: "#0F172A" }}>Siparislerim</h2>
          <p style={{ color: "#64748b", marginBottom: 0 }}>Hesabiniza ait tum siparisler.</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="info" /></div>
        ) : orders.length === 0 ? (
          <Card body className="text-center py-5 border-0 shadow-sm">
            Henuz siparisiniz bulunmuyor.
          </Card>
        ) : (
          <Row>
            {orders.map((order) => (
              <Col md="12" key={order.id} className="mb-3">
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                      <div>
                        <h5 className="mb-1">Siparis #{order.id}</h5>
                        <small className="text-muted">{order.createdAt || "-"}</small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg="secondary">{order.status || "PENDING"}</Badge>
                        <strong>{formatPrice(order.totalAmount)}</strong>
                      </div>
                    </div>
                    {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                      <div key={`${order.id}-${item.productId}-${index}`} className="d-flex justify-content-between py-2 border-top">
                        <div>
                          <strong>{item.productName}</strong>
                          <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                            {item.quantity} adet x {formatPrice(item.unitPrice)}
                          </div>
                        </div>
                        <strong>{formatPrice(item.lineTotal)}</strong>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default MyOrders;

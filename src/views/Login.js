import React from "react";
import { Link, useHistory } from "react-router-dom";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { isAuthenticated, login } from "services/authService";

function Login() {
  const history = useHistory();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (isAuthenticated()) {
      history.replace("/");
    }
  }, [history]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ username, password });
      history.replace("/");
    } catch (err) {
      setError(err && err.message ? err.message : "Giris basarisiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background:
          "radial-gradient(circle at top left, #c7f9ff 0%, rgba(255,255,255,0) 45%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col lg="5" md="7">
            <Card className="border-0 shadow" style={{ borderRadius: "18px", overflow: "hidden" }}>
              <div
                style={{
                  padding: "18px 24px",
                  background: "linear-gradient(120deg, #0ea5e9 0%, #2563eb 100%)",
                  color: "#fff",
                }}
              >
                <h4 style={{ margin: 0, fontWeight: 700 }}>Giris Yap</h4>
                <small>Hesabiniza giris yapip alisverise devam edin.</small>
              </div>
              <Card.Body style={{ padding: "24px" }}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Kullanici Adi</Form.Label>
                    <Form.Control
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Sifre</Form.Label>
                    <Form.Control
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="info" className="btn-fill w-100" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="mr-2" />
                        Giris Yapiliyor...
                      </>
                    ) : (
                      "Giris Yap"
                    )}
                  </Button>
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Hesabin yok mu? <Link to="/register">Kayit ol</Link>
                    </small>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;

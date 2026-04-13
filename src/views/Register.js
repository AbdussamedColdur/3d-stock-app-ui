import React from "react";
import { useHistory } from "react-router-dom";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { isAuthenticated, register } from "services/authService";

function Register() {
  const history = useHistory();
  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (isAuthenticated()) {
      history.replace("/");
    }
  }, [history]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Sifreler eslesmiyor.");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      history.replace("/");
    } catch (err) {
      setError(err && err.message ? err.message : "Kayit islemi basarisiz.");
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
          "radial-gradient(circle at top left, #d9f99d 0%, rgba(255,255,255,0) 45%), linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col lg="5" md="7">
            <Card className="border-0 shadow" style={{ borderRadius: "18px", overflow: "hidden" }}>
              <div
                style={{
                  padding: "18px 24px",
                  background: "linear-gradient(120deg, #22c55e 0%, #16a34a 100%)",
                  color: "#fff",
                }}
              >
                <h4 style={{ margin: 0, fontWeight: 700 }}>Kayıt Ol</h4>
                <small>Yeni hesap oluşturup alışverişe başlayın.</small>
              </div>
              <Card.Body style={{ padding: "24px" }}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Kullanıcı Adı</Form.Label>
                    <Form.Control name="username" value={formData.username} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>E-posta</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Şifre</Form.Label>
                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Şifre Tekrar</Form.Label>
                    <Form.Control type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                  </Form.Group>
                  <Button type="submit" variant="success" className="btn-fill w-100" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="mr-2" />
                        Kayıt Oluşturuluyor...
                      </>
                    ) : (
                      "Kayıt Ol"
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Register;

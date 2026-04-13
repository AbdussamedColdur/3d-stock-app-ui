import React from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import useCategories from "hooks/useCategories";

function Categories() {
  const {
    categories,
    stats,
    loading,
    actionLoading,
    error,
    addCategory,
    editCategory,
    removeCategory,
  } = useCategories();

  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [editingId, setEditingId] = React.useState(null);
  const [editingName, setEditingName] = React.useState("");

  const handleCreate = async (event) => {
    event.preventDefault();
    const created = await addCategory(newCategoryName);
    if (created) {
      setNewCategoryName("");
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const submitEdit = async (categoryId) => {
    const updated = await editCategory(categoryId, editingName);
    if (updated) {
      cancelEdit();
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Bu kategoriyi silmek istediginize emin misiniz?")) {
      return;
    }

    await removeCategory(categoryId);
  };

  return (
    <Container fluid>
      {error && (
        <Row>
          <Col md="12">
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-3">
        <Col lg="3" sm="6">
          <Card className="card-stats">
            <Card.Body>
              <Row>
                <Col xs="5">
                  <div className="icon-big text-center icon-warning">
                    <i className="nc-icon nc-tag-content text-info"></i>
                  </div>
                </Col>
                <Col xs="7">
                  <div className="numbers">
                    <p className="card-category">Toplam Kategori</p>
                    <Card.Title as="h4">{stats.total}</Card.Title>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col lg="3" sm="6">
          <Card className="card-stats">
            <Card.Body>
              <Row>
                <Col xs="5">
                  <div className="icon-big text-center icon-warning">
                    <i className="nc-icon nc-notes text-warning"></i>
                  </div>
                </Col>
                <Col xs="7">
                  <div className="numbers">
                    <p className="card-category">Uzun Isim</p>
                    <Card.Title as="h4">{stats.longNames}</Card.Title>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md="12">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Kategori Yonetimi</Card.Title>
              <p className="card-category">Kategori ekleme, guncelleme ve silme islemleri</p>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreate} className="mb-4">
                <Row className="align-items-end">
                  <Col md="8">
                    <Form.Group className="mb-0">
                      <Form.Label>Yeni Kategori Adi</Form.Label>
                      <Form.Control
                        type="text"
                        value={newCategoryName}
                        onChange={(event) => setNewCategoryName(event.target.value)}
                        placeholder="Ornek: Telefon"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md="4" className="text-right mt-2 mt-md-0">
                    <Button type="submit" variant="info" className="btn-fill" disabled={actionLoading}>
                      Kategori Ekle
                    </Button>
                  </Col>
                </Row>
              </Form>

              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="info" />
                </div>
              ) : (
                <Table className="table-hover" responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Kategori Adi</th>
                      <th>Durum</th>
                      <th className="text-right">Islemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>
                          {editingId === category.id ? (
                            <Form.Control
                              type="text"
                              value={editingName}
                              onChange={(event) => setEditingName(event.target.value)}
                            />
                          ) : (
                            category.name
                          )}
                        </td>
                        <td>
                          <Badge bg="success">Aktif</Badge>
                        </td>
                        <td className="text-right">
                          {editingId === category.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="info"
                                className="mr-2"
                                disabled={actionLoading}
                                onClick={() => submitEdit(category.id)}
                              >
                                Kaydet
                              </Button>
                              <Button size="sm" variant="secondary" onClick={cancelEdit}>
                                Iptal
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline-info"
                                className="mr-2"
                                onClick={() => startEdit(category)}
                              >
                                Duzenle
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(category.id)}
                              >
                                Sil
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          Kategori bulunamadi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Categories;

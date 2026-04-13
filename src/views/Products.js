import React from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  Form,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

import useProducts from "hooks/useProducts";
import ProductForm from "components/Products/ProductForm";
import { getPrimaryCategoryName } from "utils/productModel";
import "assets/css/products.css";

function Products() {
  const {
    products,
    categories,
    stats,
    loading,
    actionLoading,
    error,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImages,
    deleteImages,
  } = useProducts();

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [viewMode, setViewMode] = React.useState("table"); // "table" or "grid"

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      deleteProduct(id);
    }
  };

  const handleAddSubmit = (data) => {
    return addProduct(data);
  };

  const handleEditSubmit = (data) => {
    if (editingProduct) {
      return updateProduct(editingProduct.id, data);
    }
    setEditingProduct(null);
    return Promise.resolve(null);
  };

  const formatPrice = (price) => {
    return "₺" + price.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
  };

  return (
    <>
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

        {/* Stats Row */}
        <Row className="product-stats">
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-box text-info"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Toplam Ürün</p>
                      <Card.Title as="h4">{stats.total}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-box mr-1"></i>
                  Tüm ürünler
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-check-2 text-success"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Aktif Ürün</p>
                      <Card.Title as="h4">{stats.active}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-check-circle mr-1"></i>
                  Satışta
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-simple-remove text-danger"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Stok Tükenen</p>
                      <Card.Title as="h4">{stats.outOfStock}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Yeniden sipariş gerekli
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-money-coins text-warning"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Toplam Değer</p>
                      <Card.Title as="h4">
                        {stats.totalValue > 1000
                          ? `₺${(stats.totalValue / 1000).toFixed(0)}K`
                          : formatPrice(stats.totalValue)}
                      </Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-coins mr-1"></i>
                  Stok değeri
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        {/* Filters & Actions */}
        <Row>
          <Col md="12">
            <Card>
              <Card.Body className="product-filters">
                <Row className="align-items-center">
                  <Col md="4">
                    <small className="filter-label">Arama</small>
                    <Form.Control
                      placeholder="🔍 Ürün ara..."
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                  <Col md="2">
                    <small className="filter-label">Kategori</small>
                    <Form.Control
                      as="select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="all">Tüm Kategoriler</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Form.Control>
                  </Col>
                  <Col md="2">
                    <small className="filter-label">Durum</small>
                    <Form.Control
                      as="select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                    </Form.Control>
                  </Col>
                  <Col md="2" className="view-toggle d-flex align-items-end">
                    <Button
                      size="sm"
                      variant={viewMode === "table" ? "info" : "outline-secondary"}
                      onClick={() => setViewMode("table")}
                      className="mr-1"
                    >
                      <i className="fas fa-list"></i>
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "grid" ? "info" : "outline-secondary"}
                      onClick={() => setViewMode("grid")}
                    >
                      <i className="fas fa-th"></i>
                    </Button>
                  </Col>
                  <Col md="2" className="text-right d-flex align-items-end justify-content-end">
                    <Button
                      className="btn-fill btn-add-product"
                      variant="info"
                      disabled={actionLoading}
                      onClick={() => setShowAddModal(true)}
                    >
                      <i className="fas fa-plus mr-1"></i>
                      Ürün Ekle
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Products Table View */}
        {viewMode === "table" && (
          <Row>
            <Col md="12">
              <Card className="product-table">
                <Card.Header>
                  <Card.Title as="h4" className="mb-1">Ürün Listesi</Card.Title>
                  <p className="card-category">
                    {products.length} ürün gösteriliyor
                  </p>
                </Card.Header>
                <Card.Body className="table-full-width table-responsive px-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="info" />
                    </div>
                  ) : products.length === 0 ? (
                    <div className="empty-state">
                      <i className="nc-icon nc-cart-simple"></i>
                      <h5>Ürün bulunamadı</h5>
                      <p>
                        Henüz ürün eklenmemiş veya arama kriterlerinize uygun
                        ürün yok.
                      </p>
                      <Button
                        className="btn-fill"
                        variant="info"
                        disabled={actionLoading}
                        onClick={() => setShowAddModal(true)}
                      >
                        <i className="fas fa-plus mr-1"></i>
                        İlk Ürünü Ekle
                      </Button>
                    </div>
                  ) : (
                    <Table className="table-hover" responsive>
                      <thead>
                        <tr>
                          <th>Ürün Adı</th>
                          <th>Kategori</th>
                          <th>Fiyat</th>
                          <th>Stok</th>
                          <th>Durum</th>
                          <th className="text-right">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td>
                              <strong>{product.name}</strong>
                              <br />
                              <small className="text-muted">
                                {product.description.length > 50
                                  ? product.description.substring(0, 50) + "..."
                                  : product.description}
                              </small>
                            </td>
                            <td>
                              <div className="category-badges">
                                {(Array.isArray(product.categories)
                                  ? product.categories
                                  : []
                                ).slice(0, 2).map((category) => (
                                  <Badge
                                    key={`${product.id}-${category.id}-${category.name}`}
                                    bg="light"
                                    text="dark"
                                    className="category-badge"
                                  >
                                    {category.name}
                                  </Badge>
                                ))}
                                {Array.isArray(product.categories) && product.categories.length > 2 && (
                                  <Badge bg="secondary" className="category-badge">
                                    +{product.categories.length - 2}
                                  </Badge>
                                )}
                                {(!Array.isArray(product.categories) || product.categories.length === 0) && (
                                  <Badge bg="light" text="dark" className="category-badge">
                                    {getPrimaryCategoryName(product) || "Kategori yok"}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="product-price">
                              {formatPrice(product.price)}
                            </td>
                            <td>
                              {product.stock === 0 ? (
                                <Badge bg="danger">Tükendi</Badge>
                              ) : product.stock < 10 ? (
                                <span className="text-warning">
                                  <strong>{product.stock}</strong>
                                </span>
                              ) : (
                                product.stock
                              )}
                            </td>
                            <td>
                              <span
                                className={`status-dot ${product.status}`}
                              ></span>
                              {product.status === "active"
                                ? "Aktif"
                                : "Pasif"}
                            </td>
                            <td className="td-actions text-right">
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id={`tooltip-edit-${product.id}`}>
                                    Düzenle
                                  </Tooltip>
                                }
                              >
                                <Button
                                  className="btn-simple btn-link p-1"
                                  type="button"
                                  variant="info"
                                  onClick={() => handleEdit(product)}
                                >
                                  <i className="fas fa-edit"></i>
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger
                                overlay={
                                  <Tooltip id={`tooltip-del-${product.id}`}>
                                    Sil
                                  </Tooltip>
                                }
                              >
                                <Button
                                  className="btn-simple btn-link p-1"
                                  type="button"
                                  variant="danger"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </OverlayTrigger>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Products Grid View */}
        {viewMode === "grid" && (
          <Row>
            {loading ? (
              <Col md="12">
                <Card>
                  <Card.Body className="text-center py-5">
                    <Spinner animation="border" variant="info" />
                  </Card.Body>
                </Card>
              </Col>
            ) : products.length === 0 ? (
              <Col md="12">
                <Card>
                  <Card.Body>
                    <div className="empty-state">
                      <i className="nc-icon nc-cart-simple"></i>
                      <h5>Ürün bulunamadı</h5>
                      <p>
                        Henüz ürün eklenmemiş veya arama kriterlerinize uygun
                        ürün yok.
                      </p>
                      <Button
                        className="btn-fill"
                        variant="info"
                        disabled={actionLoading}
                        onClick={() => setShowAddModal(true)}
                      >
                        <i className="fas fa-plus mr-1"></i>
                        İlk Ürünü Ekle
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ) : (
              products.map((product) => (
                <Col lg="4" md="6" key={product.id}>
                  <Card className="product-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <Card.Title as="h5" className="mb-1">
                            {product.name}
                          </Card.Title>
                          <small className="text-muted">
                            {getPrimaryCategoryName(product)}
                          </small>
                        </div>
                        <div>
                          <Badge
                            bg={
                              product.status === "active"
                                ? "success"
                                : "secondary"
                            }
                            className="product-badge"
                          >
                            {product.status === "active" ? "Aktif" : "Pasif"}
                          </Badge>
                          {product.stock === 0 && (
                            <Badge bg="danger" className="product-badge ml-1">
                              Stok Yok
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-muted product-description">
                        {product.description}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                          <span className="product-price">
                            {formatPrice(product.price)}
                          </span>
                          <span
                            className="text-muted ml-2"
                            style={{ fontSize: "0.85em" }}
                          >
                            Stok: {product.stock}
                          </span>
                        </div>
                        <div>
                          <Button
                            className="btn-simple btn-link p-1"
                            variant="info"
                            onClick={() => handleEdit(product)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            className="btn-simple btn-link p-1"
                            variant="danger"
                            onClick={() => handleDelete(product.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}
      </Container>

      {/* Add Product Modal */}
      <ProductForm
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        onUploadImages={uploadImages}
        onDeleteImages={deleteImages}
        product={null}
        categories={categories}
        title="Yeni Ürün Ekle"
      />

      {/* Edit Product Modal */}
      <ProductForm
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        onSubmit={handleEditSubmit}
        onUploadImages={uploadImages}
        onDeleteImages={deleteImages}
        product={editingProduct}
        categories={categories}
        title="Ürün Düzenle"
      />
    </>
  );
}

export default Products;

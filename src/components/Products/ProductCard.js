import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { getPrimaryCategoryName } from "utils/productModel";

function ProductCard({ product, onEdit, onDelete }) {
  const statusBadge =
    product.status === "active" ? (
      <Badge bg="success" className="product-badge">Aktif</Badge>
    ) : (
      <Badge bg="secondary" className="product-badge">Pasif</Badge>
    );

  const stockBadge =
    product.stock === 0 ? (
      <Badge bg="danger" className="product-badge ml-1">Stok Yok</Badge>
    ) : product.stock < 10 ? (
      <Badge bg="warning" className="product-badge ml-1">Az Stok</Badge>
    ) : null;

  return (
    <Card className="product-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Card.Title as="h5" className="mb-1">{product.name}</Card.Title>
            <small className="text-muted">{getPrimaryCategoryName(product)}</small>
          </div>
          <div>
            {statusBadge}
            {stockBadge}
          </div>
        </div>
        <p className="text-muted product-description">{product.description}</p>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <span className="product-price">
              ₺{product.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-muted ml-2" style={{ fontSize: "0.85em" }}>
              Stok: {product.stock}
            </span>
          </div>
          <div>
            <Button
              className="btn-simple btn-link p-1"
              variant="info"
              onClick={() => onEdit(product)}
              title="Düzenle"
            >
              <i className="fas fa-edit"></i>
            </Button>
            <Button
              className="btn-simple btn-link p-1"
              variant="danger"
              onClick={() => onDelete(product.id)}
              title="Sil"
            >
              <i className="fas fa-trash"></i>
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;

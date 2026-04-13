import React from "react";
import ReactDOM from "react-dom";
import { Alert, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import {
  PRODUCT_STATUS_OPTIONS,
  validateProductPayload,
} from "utils/productModel";

const MAX_IMAGE_COUNT = 12;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function buildImageItems(images) {
  if (!Array.isArray(images)) return [];

  return images.map((image, index) => ({
    id: Number.isInteger(image.id) ? image.id : Number.parseInt(image.id, 10) || null,
    localKey: `existing-${image.id || index}-${index}`,
    file: null,
    imageUrl: image.imageUrl || "",
    previewUrl: "",
    altText: image.altText || "",
    displayOrder:
      Number.isInteger(image.displayOrder) && image.displayOrder >= 0
        ? image.displayOrder
        : index,
  }));
}

function cleanupPreviewUrls(imageItems) {
  (Array.isArray(imageItems) ? imageItems : []).forEach((item) => {
    if (item && item.file && item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  });
}

function ProductForm({
  show,
  onHide,
  onSubmit,
  onUploadImages,
  onDeleteImages,
  product,
  title,
  categories,
}) {
  const categoryOptions = React.useMemo(() => {
    const source = Array.isArray(categories) ? categories : [];
    return Array.from(
      new Set(
        source
          .map((name) => (typeof name === "string" ? name.trim() : ""))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "tr"));
  }, [categories]);

  const allowedCategorySet = React.useMemo(
    () => new Set(categoryOptions),
    [categoryOptions]
  );

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    price: "",
    categories: [],
    imageItems: [],
    stockQuantity: "",
    status: "active",
  });
  const [categorySearch, setCategorySearch] = React.useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const imageItemsRef = React.useRef([]);
  const deletedImageIdsRef = React.useRef([]);
  const fileInputRef = React.useRef(null);
  const categoryDropdownRef = React.useRef(null);

  const filteredCategoryOptions = React.useMemo(() => {
    const search = categorySearch.trim().toLocaleLowerCase("tr-TR");
    if (!search) return categoryOptions;

    return categoryOptions.filter((categoryName) =>
      categoryName.toLocaleLowerCase("tr-TR").includes(search)
    );
  }, [categoryOptions, categorySearch]);

  React.useEffect(() => {
    setFormData((prev) => {
      cleanupPreviewUrls(prev.imageItems);

      if (product) {
        return {
          name: product.name || "",
          description: product.description || "",
          price: product.price || "",
          categories: Array.isArray(product.categories)
            ? product.categories
                .map((category) => category.name)
                .filter((name) => allowedCategorySet.has(name))
            : [],
          imageItems: buildImageItems(product.images),
          stockQuantity:
            product.stockQuantity !== undefined
              ? product.stockQuantity
              : product.stock || "",
          status: product.status || "active",
        };
      }

      return {
        name: "",
        description: "",
        price: "",
        categories: [],
        imageItems: [],
        stockQuantity: "",
        status: "active",
      };
    });

    setCategorySearch("");
    setIsCategoryDropdownOpen(false);
    setFormError("");
    setIsSubmitting(false);
    deletedImageIdsRef.current = [];
  }, [product, show, allowedCategorySet]);

  React.useEffect(() => {
    imageItemsRef.current = formData.imageItems;
  }, [formData.imageItems]);

  React.useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  React.useEffect(() => {
    return () => {
      cleanupPreviewUrls(imageItemsRef.current);
    };
  }, []);

  React.useEffect(() => {
    const onDocumentClick = (event) => {
      if (!categoryDropdownRef.current) {
        return;
      }

      if (!categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener("mousedown", onDocumentClick);
    }

    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
    };
  }, [isCategoryDropdownOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (categoryName) => {
    if (!allowedCategorySet.has(categoryName)) {
      return;
    }

    setFormData((prev) => {
      const nextSet = new Set(prev.categories);
      if (nextSet.has(categoryName)) {
        nextSet.delete(categoryName);
      } else {
        nextSet.add(categoryName);
      }

      return { ...prev, categories: Array.from(nextSet) };
    });
  };

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    setFormData((prev) => {
      const existingCount = prev.imageItems.length;
      const allowedSlots = Math.max(0, MAX_IMAGE_COUNT - existingCount);
      const accepted = [];
      const rejected = [];

      files.slice(0, allowedSlots).forEach((file) => {
        const safeType = typeof file.type === "string" ? file.type : "";

        if (!safeType.startsWith("image/")) {
          rejected.push(`${file.name}: sadece gorsel dosyasi kabul edilir.`);
          return;
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          rejected.push(`${file.name}: dosya boyutu 10MB ustunde.`);
          return;
        }

        accepted.push({
          localKey: `local-${Date.now()}-${file.name}-${Math.random()}`,
          file,
          imageUrl: "",
          previewUrl: URL.createObjectURL(file),
          altText: "",
          displayOrder: existingCount + accepted.length,
        });
      });

      if (files.length > allowedSlots) {
        rejected.push(`En fazla ${MAX_IMAGE_COUNT} gorsel eklenebilir.`);
      }

      setFormError(rejected.join(" "));
      return {
        ...prev,
        imageItems: [...prev.imageItems, ...accepted],
      };
    });

    event.target.value = "";
  };

  const handleImageAltTextChange = (index, altText) => {
    setFormData((prev) => {
      const nextItems = [...prev.imageItems];
      if (!nextItems[index]) return prev;

      nextItems[index] = {
        ...nextItems[index],
        altText,
      };

      return {
        ...prev,
        imageItems: nextItems,
      };
    });
  };

  const removeImageItem = (index) => {
    setFormData((prev) => {
      const nextItems = [...prev.imageItems];
      const [removed] = nextItems.splice(index, 1);

      if (removed && removed.file && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      if (removed && !removed.file && Number.isInteger(removed.id) && removed.id > 0) {
        deletedImageIdsRef.current = [...deletedImageIdsRef.current, removed.id];
      }

      return {
        ...prev,
        imageItems: nextItems.map((item, i) => ({
          ...item,
          displayOrder: i,
        })),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const localImageItems = formData.imageItems.filter((item) => item.file);
    const images = formData.imageItems
      .map((item, index) => {
        const imageUrl = item.file ? "" : item.imageUrl;
        return {
          imageUrl,
          altText: (item.altText || "").trim(),
          displayOrder: index,
        };
      })
      .filter((item) => Boolean(item.imageUrl));

    const safeSelectedCategories = formData.categories.filter((name) =>
      allowedCategorySet.has(name)
    );

    if (safeSelectedCategories.length === 0) {
      setFormError("Lutfen veritabanindaki kategorilerden en az birini secin.");
      return;
    }

    const payload = {
      id: product && product.id ? product.id : undefined,
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price) || 0,
      stockQuantity: Number.parseInt(formData.stockQuantity, 10) || 0,
      status: formData.status,
      categories: safeSelectedCategories.map((name) => ({ name })),
      images,
    };

    const validation = validateProductPayload(payload, {
      isUpdate: Boolean(product && product.id),
    });

    if (!validation.isValid) {
      setFormError(validation.errors.join(" "));
      return;
    }

    setIsSubmitting(true);
    try {
      const savedProduct = await onSubmit(validation.value);
      if (savedProduct === null || savedProduct === false) {
        return;
      }

      const productId = savedProduct && savedProduct.id ? savedProduct.id : product && product.id;
      if (!productId) {
        setFormError("Islem sonrasi urun ID bulunamadi.");
        return;
      }

      if (deletedImageIdsRef.current.length > 0) {
        if (typeof onDeleteImages !== "function") {
          setFormError("Gorsel silme servisi hazir degil.");
          return;
        }

        const deleted = await onDeleteImages(productId, deletedImageIdsRef.current);
        if (!deleted) {
          setFormError("Bazi gorseller silinemedi. Lutfen tekrar deneyin.");
          return;
        }
      }

      if (localImageItems.length > 0) {
        if (typeof onUploadImages !== "function") {
          setFormError("Gorsel yukleme servisi hazir degil.");
          return;
        }

        const uploadPayload = localImageItems.map((item, index) => ({
          file: item.file,
          altText: (item.altText || "").trim(),
          displayOrder: Number.isInteger(item.displayOrder)
            ? item.displayOrder
            : images.length + index,
        }));

        const uploadResult = await onUploadImages(productId, uploadPayload);
        if (!Array.isArray(uploadResult) || uploadResult.length !== uploadPayload.length) {
          setFormError("Bazi gorseller yuklenemedi. Lutfen tekrar deneyin.");
          return;
        }
      }

      onHide();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  const modalContent = (
    <>
      <div
        onClick={onHide}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9998,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          width: "90%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 15px 50px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "2px solid #f0f0f0",
          }}
        >
          <h4 style={{ margin: 0, fontWeight: 600 }}>{title || "Urun Ekle"}</h4>
          <button
            type="button"
            onClick={onHide}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5em",
              cursor: "pointer",
              color: "#999",
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            x
          </button>
        </div>

        <Form onSubmit={handleSubmit}>
          <div style={{ padding: "24px" }}>
            {formError && <Alert variant="danger" className="mb-3">{formError}</Alert>}

            <Row>
              <Col md="8">
                <Form.Group className="mb-3">
                  <label>
                    Urun Adi <span className="text-danger">*</span>
                  </label>
                  <Form.Control
                    name="name"
                    placeholder="Urun adini girin"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group className="mb-3">
                  <label>Kategoriler</label>
                  <div className="category-dropdown" ref={categoryDropdownRef}>
                    <button
                      type="button"
                      className="category-dropdown-toggle"
                      onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                    >
                      {isCategoryDropdownOpen ? (
                        <Form.Control
                          placeholder="Kategori ara..."
                          type="text"
                          value={categorySearch}
                          onChange={(event) => setCategorySearch(event.target.value)}
                          className="category-toggle-search"
                          autoComplete="off"
                          onClick={(event) => event.stopPropagation()}
                        />
                      ) : (
                        <span>
                          {formData.categories.length > 0
                            ? `${formData.categories.length} kategori secildi`
                            : "Kategori secin"}
                        </span>
                      )}
                      <i
                        className={`fas fa-chevron-${isCategoryDropdownOpen ? "up" : "down"}`}
                      ></i>
                    </button>

                    {isCategoryDropdownOpen && (
                      <div className="category-dropdown-panel">
                        <div className="category-dropdown-list">
                          {filteredCategoryOptions.map((categoryName) => (
                            <Form.Check
                              key={categoryName}
                              type="checkbox"
                              id={`category-${categoryName}`}
                              className="mb-1"
                              label={categoryName}
                              checked={formData.categories.includes(categoryName)}
                              onChange={() => toggleCategory(categoryName)}
                            />
                          ))}
                          {filteredCategoryOptions.length === 0 && (
                            <small className="text-muted">Eslesen kategori bulunamadi.</small>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {categoryOptions.length === 0 && (
                    <small className="text-danger d-block mt-2">
                      Veritabani kategorileri yuklenemedi. Kategori secimi olmadan kayit yapilamaz.
                    </small>
                  )}
                  {formData.categories.length > 0 && (
                    <small className="text-muted d-block mt-2">
                      Secilen: {formData.categories.join(", ")}
                    </small>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md="12">
                <Form.Group className="mb-3">
                  <label>Aciklama</label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    placeholder="Urun aciklamasini girin"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md="12">
                <Form.Group className="mb-3">
                  <label>Gorseller (Yerel Dosya Secimi)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesSelected}
                    style={{ display: "none" }}
                  />
                  <div className="image-picker-shell">
                    <div className="image-picker-title">Cihazinizdan bir veya daha fazla gorsel secin</div>
                    <div className="image-picker-subtitle">
                      Seçilen dosyalar alt bölümde onizleme ve aciklama alaniyla listelenir.
                    </div>
                    <Button
                      type="button"
                      variant="outline-info"
                      className="image-picker-btn"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      <i className="fas fa-cloud-upload-alt mr-2"></i>
                      Dosya Sec
                    </Button>
                    <small className="text-muted d-block mt-2">
                      Mevcut: {formData.imageItems.length} / {MAX_IMAGE_COUNT} gorsel
                    </small>
                  </div>
                  <small className="text-muted d-block mt-2">
                    PNG/JPG/WEBP desteklenir. Her dosya en fazla 10MB, toplam en fazla {MAX_IMAGE_COUNT} gorsel.
                  </small>

                  <div className="image-upload-list mt-3">
                    {formData.imageItems.map((item, index) => (
                      <div key={item.localKey} className="image-upload-row">
                        <div className="image-upload-preview">
                          {item.previewUrl || item.imageUrl ? (
                            <img
                              src={item.previewUrl || item.imageUrl}
                              alt={item.altText || `Gorsel ${index + 1}`}
                            />
                          ) : (
                            <span>Yok</span>
                          )}
                        </div>
                        <div className="image-upload-fields">
                          <Form.Control
                            type="text"
                            placeholder="Gorsel aciklamasi (alt text)"
                            value={item.altText || ""}
                            onChange={(event) => handleImageAltTextChange(index, event.target.value)}
                          />
                          <small className="text-muted">Sira: {index + 1}</small>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeImageItem(index)}
                        >
                          Kaldir
                        </Button>
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md="4">
                <Form.Group className="mb-3">
                  <label>
                    Fiyat (TL) <span className="text-danger">*</span>
                  </label>
                  <Form.Control
                    name="price"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group className="mb-3">
                  <label>
                    Stok Adedi <span className="text-danger">*</span>
                  </label>
                  <Form.Control
                    name="stockQuantity"
                    placeholder="0"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group className="mb-3">
                  <label>Durum</label>
                  <Form.Control
                    as="select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {PRODUCT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              padding: "16px 24px",
              borderTop: "2px solid #f0f0f0",
            }}
          >
            <Button variant="secondary" onClick={onHide}>Iptal</Button>
            <Button className="btn-fill" variant="info" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="mr-2" />
                  Kaydediliyor...
                </>
              ) : product ? (
                "Guncelle"
              ) : (
                "Urun Ekle"
              )}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default ProductForm;

import apiClient from "services/apiClient";
import {
  normalizeProduct,
  validateProductPayload,
} from "utils/productModel";

const PRODUCTS_ENDPOINT = "/api/products";
const PRODUCT_IMAGE_UPLOAD_ENDPOINT =
  process.env.REACT_APP_PRODUCT_IMAGE_UPLOAD_ENDPOINT || "/api/products/{id}/images";

const mapFromApi = (product) => normalizeProduct(product);

/**
 * Map frontend product model to backend API payload (create/update).
 * Backend expects: name, description, price, stockQuantity, status, categories  
 * (without id), images (without id).
 */
const mapToApi = (product, { excludeId = true } = {}) => {
  const payload = {
    name: product.name,
    description: product.description,
    price: product.price,
    stockQuantity: product.stockQuantity,
    status: product.status,
    categories: Array.isArray(product.categories)
      ? product.categories.map(({ name }) => ({ name }))
      : [],
  };

  // Include id only for update operations if not excluded
  if (!excludeId && product.id) {
    payload.id = product.id;
  }

  return payload;
};

function normalizeResponse(payload) {
  if (Array.isArray(payload)) {
    return payload.map(mapFromApi);
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items.map(mapFromApi);
  }

  if (payload && typeof payload === "object") {
    return [mapFromApi(payload)];
  }

  return [];
}

function validateInput(product, options = {}) {
  const result = validateProductPayload(product, options);
  if (!result.isValid) {
    throw new Error(result.errors.join(" "));
  }

  return result.value;
}

function resolveImageUploadEndpoint(productId) {
  const safeId = Number.parseInt(productId, 10);
  if (!Number.isInteger(safeId) || safeId <= 0) {
    throw new Error("Gecersiz urun ID.");
  }

  return PRODUCT_IMAGE_UPLOAD_ENDPOINT.includes("{id}")
    ? PRODUCT_IMAGE_UPLOAD_ENDPOINT.replace("{id}", String(safeId))
    : `${PRODUCTS_ENDPOINT}/${safeId}/images`;
}

export async function uploadProductImages(productId, imageInputs) {
  const safeImages = Array.isArray(imageInputs) ? imageInputs.filter(Boolean) : [];
  if (safeImages.length === 0) {
    return [];
  }

  const endpoint = resolveImageUploadEndpoint(productId);
  const responses = [];

  for (const imageInput of safeImages) {
    const formData = new FormData();
    formData.append("file", imageInput.file);

    if (typeof imageInput.altText === "string" && imageInput.altText.trim()) {
      formData.append("altText", imageInput.altText.trim());
    }

    if (Number.isInteger(imageInput.displayOrder) && imageInput.displayOrder >= 0) {
      formData.append("displayOrder", String(imageInput.displayOrder));
    }

    const response = await apiClient.post(endpoint, formData);
    responses.push(response);
  }

  return responses.map((item, index) => ({
    id: item && item.id,
    imageUrl:
      (item && (item.imageUrl || item.url || item.path)) ||
      (safeImages[index] && safeImages[index].previewUrl) ||
      "",
    altText:
      item && typeof item.altText === "string"
        ? item.altText
        : (safeImages[index] && safeImages[index].altText) || "",
    displayOrder:
      item && Number.isInteger(item.displayOrder)
        ? item.displayOrder
        : safeImages[index] && Number.isInteger(safeImages[index].displayOrder)
          ? safeImages[index].displayOrder
          : index,
  }));
}

export async function removeProductImage(productId, imageId) {
  const safeProductId = Number.parseInt(productId, 10);
  const safeImageId = Number.parseInt(imageId, 10);

  if (!Number.isInteger(safeProductId) || safeProductId <= 0) {
    throw new Error("Gecersiz urun ID.");
  }

  if (!Number.isInteger(safeImageId) || safeImageId <= 0) {
    throw new Error("Gecersiz gorsel ID.");
  }

  await apiClient.delete(`${PRODUCTS_ENDPOINT}/${safeProductId}/images/${safeImageId}`);
}

export async function getProducts() {
  const products = await apiClient.get(PRODUCTS_ENDPOINT);
  return normalizeResponse(products);
}

export async function getProductById(id) {
  const safeId = Number.parseInt(id, 10);
  if (!Number.isInteger(safeId) || safeId <= 0) {
    throw new Error("Gecersiz urun ID.");
  }

  const product = await apiClient.get(`${PRODUCTS_ENDPOINT}/${safeId}`);
  return mapFromApi(product);
}

export async function createProduct(product) {
  const safeProduct = validateInput(product);
  const newProduct = await apiClient.post(PRODUCTS_ENDPOINT, mapToApi(safeProduct, { excludeId: true }));
  return mapFromApi(newProduct);
}

export async function editProduct(id, updates) {
  const safeId = Number.parseInt(id, 10);
  if (!Number.isInteger(safeId) || safeId <= 0) {
    throw new Error("Gecersiz urun ID.");
  }

  const safeProduct = validateInput({ ...updates, id: safeId }, { isUpdate: true });
  const updatedProduct = await apiClient.put(
    `${PRODUCTS_ENDPOINT}/${safeId}`,
    mapToApi(safeProduct, { excludeId: true })
  );
  return mapFromApi(updatedProduct);
}

export async function removeProduct(id) {
  const safeId = Number.parseInt(id, 10);
  if (!Number.isInteger(safeId) || safeId <= 0) {
    throw new Error("Gecersiz urun ID.");
  }

  await apiClient.delete(`${PRODUCTS_ENDPOINT}/${safeId}`);
}

import apiClient from "services/apiClient";

const CATEGORIES_ENDPOINT = "/api/categories";

function sanitizeName(name) {
  return typeof name === "string" ? name.replace(/\s+/g, " ").trim() : "";
}

function normalizeCategory(item, fallbackId) {
  return {
    id: Number.parseInt(item && item.id, 10) || fallbackId,
    name: sanitizeName(item && item.name),
  };
}

export async function getCategories() {
  const response = await apiClient.get(CATEGORIES_ENDPOINT);
  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .map((item, index) => normalizeCategory(item, index + 1))
    .filter((item) => item.name.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

export async function createCategory(payload) {
  const name = sanitizeName(payload && payload.name);
  if (!name) {
    throw new Error("Kategori adi zorunludur.");
  }

  const response = await apiClient.post(CATEGORIES_ENDPOINT, { name });
  return normalizeCategory(response, Date.now());
}

export async function updateCategory(id, payload) {
  const safeId = Number.parseInt(id, 10);
  if (!Number.isInteger(safeId) || safeId <= 0) {
    throw new Error("Gecersiz kategori ID.");
  }

  const name = sanitizeName(payload && payload.name);
  if (!name) {
    throw new Error("Kategori adi zorunludur.");
  }

  const response = await apiClient.put(`${CATEGORIES_ENDPOINT}/${safeId}`, { name });
  return normalizeCategory(response, safeId);
}

export async function deleteCategory(id) {
  const safeId = Number.parseInt(id, 10);
  if (!Number.isInteger(safeId) || safeId <= 0) {
    throw new Error("Gecersiz kategori ID.");
  }

  await apiClient.delete(`${CATEGORIES_ENDPOINT}/${safeId}`);
}

const DEFAULT_CATEGORY_NAMES = [
  "Elektronik",
  "Giyim",
  "Gida",
  "Spor",
  "Ev ve Yasam",
  "Kitap",
  "Kozmetik",
  "Apple",
  "Telefon",
];

const ALLOWED_STATUS = new Set(["active", "inactive"]);

function cleanText(value, maxLength = 250) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toSafeInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function isValidImageUrl(url) {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Allow local file storage paths like /uploads/products/image.jpg
  if (trimmed.startsWith("/")) {
    return !trimmed.includes("..") && !trimmed.includes("\\");
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function normalizeCategories(categoriesInput) {
  const source = Array.isArray(categoriesInput)
    ? categoriesInput
    : typeof categoriesInput === "string" && categoriesInput
      ? [{ id: 1, name: categoriesInput }]
      : [];

  const seen = new Set();
  const normalized = [];

  source.forEach((category, index) => {
    const name = cleanText(category && category.name ? category.name : category, 60);
    if (!name) {
      return;
    }

    const key = name.toLocaleLowerCase("tr-TR");
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    normalized.push({
      id: toSafeInteger(category && category.id, index + 1),
      name,
    });
  });

  return normalized;
}

function normalizeImages(imagesInput) {
  const source = Array.isArray(imagesInput)
    ? imagesInput
    : typeof imagesInput === "string" && imagesInput
      ? [{ id: 1, imageUrl: imagesInput, altText: "", displayOrder: 0 }]
      : [];

  const seen = new Set();
  const normalized = [];

  source.forEach((image, index) => {
    const imageUrl = cleanText(
      image && image.imageUrl ? image.imageUrl : image,
      2048
    );

    if (!isValidImageUrl(imageUrl)) {
      return;
    }

    const displayOrder = toSafeInteger(image && image.displayOrder, index);
    const dedupeKey = `${imageUrl}|${displayOrder}`;
    if (seen.has(dedupeKey)) {
      return;
    }

    seen.add(dedupeKey);
    normalized.push({
      id: null, // Will be reassigned after sorting
      imageUrl,
      altText: cleanText(image && image.altText, 140),
      displayOrder,
    });
  });

  return normalized
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((img, index) => ({ ...img, id: index + 1 }));
}

export function normalizeProduct(rawProduct) {
  const categories = normalizeCategories(
    rawProduct && rawProduct.categories ? rawProduct.categories : rawProduct && rawProduct.category
  );

  const images = normalizeImages(
    rawProduct && rawProduct.images ? rawProduct.images : rawProduct && rawProduct.imageUrl
  );

  const stockQuantity = Math.max(
    0,
    toSafeInteger(
      rawProduct && rawProduct.stockQuantity !== undefined
        ? rawProduct.stockQuantity
        : rawProduct && rawProduct.stock,
      0
    )
  );
  const status = cleanText(rawProduct && rawProduct.status, 20).toLowerCase();

  return {
    id: toSafeInteger(rawProduct && rawProduct.id, 0),
    name: cleanText(rawProduct && rawProduct.name, 120),
    description: cleanText(rawProduct && rawProduct.description, 2000),
    price: Math.max(0, toFiniteNumber(rawProduct && rawProduct.price, 0)),
    categories,
    images,
    stockQuantity,
    // Keep legacy key for existing UI usage while payload standard is stockQuantity.
    stock: stockQuantity,
    status: ALLOWED_STATUS.has(status) ? status : "active",
    category: categories[0] ? categories[0].name : "",
  };
}

export function validateProductPayload(rawProduct, { isUpdate = false } = {}) {
  const product = normalizeProduct(rawProduct || {});
  const errors = [];

  if (isUpdate && product.id <= 0) {
    errors.push("Gecerli urun ID degeri gerekli.");
  }

  if (!product.name || product.name.length < 2) {
    errors.push("Urun adi en az 2 karakter olmali.");
  }

  if (product.description.length > 2000) {
    errors.push("Aciklama en fazla 2000 karakter olabilir.");
  }

  if (!Number.isFinite(product.price) || product.price <= 0) {
    errors.push("Urun fiyati sifirdan buyuk olmali.");
  }

  if (!Array.isArray(product.categories) || product.categories.length === 0) {
    errors.push("En az bir kategori secilmeli.");
  }

  if (product.categories.length > 8) {
    errors.push("En fazla 8 kategori secilebilir.");
  }

  if (product.images.length > 12) {
    errors.push("En fazla 12 gorsel eklenebilir.");
  }

  if (!Number.isInteger(product.stockQuantity) || product.stockQuantity < 0) {
    errors.push("Stok degeri sifir veya daha buyuk tam sayi olmali.");
  }

  if (!ALLOWED_STATUS.has(product.status)) {
    errors.push("Durum active veya inactive olmali.");
  }

  return {
    value: product,
    errors,
    isValid: errors.length === 0,
  };
}

export function getCategoryNames(products) {
  const names = new Set(DEFAULT_CATEGORY_NAMES);
  (Array.isArray(products) ? products : []).forEach((product) => {
    normalizeCategories(product && product.categories).forEach((category) => {
      names.add(category.name);
    });
  });

  return Array.from(names).sort((a, b) => a.localeCompare(b, "tr"));
}

export function getPrimaryCategoryName(product) {
  if (!product) return "";
  if (product.category && typeof product.category === "string") {
    return cleanText(product.category, 60);
  }

  const normalized = normalizeCategories(product.categories);
  return normalized[0] ? normalized[0].name : "";
}

export function getPrimaryImage(product) {
  const normalized = normalizeImages(product && product.images);
  return normalized[0] ? normalized[0].imageUrl : "";
}

export function parseImageTextarea(textValue) {
  return (textValue || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split("|");
      return {
        id: index + 1,
        imageUrl: cleanText(parts[0], 2048),
        altText: cleanText(parts[1] || "", 140),
        displayOrder: index,
      };
    });
}

export const PRODUCT_STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Pasif" },
];

export const DEFAULT_PRODUCT_CATEGORIES = DEFAULT_CATEGORY_NAMES;

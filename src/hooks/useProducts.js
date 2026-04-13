import { useState, useEffect, useCallback } from "react";
import {
  createProduct,
  editProduct,
  getProducts,
  removeProductImage,
  removeProduct,
  uploadProductImages,
} from "services/productService";
import { getCategories } from "services/categoryService";
import {
  getPrimaryCategoryName,
  normalizeProduct,
} from "utils/productModel";

function getCategoryNamesFromProducts(products) {
  const names = new Set();
  (Array.isArray(products) ? products : []).forEach((product) => {
    if (Array.isArray(product && product.categories)) {
      product.categories.forEach((category) => {
        if (category && typeof category.name === "string" && category.name.trim()) {
          names.add(category.name.trim());
        }
      });
    }
  });

  return Array.from(names).sort((a, b) => a.localeCompare(b, "tr"));
}

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data.map(normalizeProduct));

      try {
        const categoryData = await getCategories();
        setCategoryOptions(categoryData.map((category) => category.name));
      } catch (categoryErr) {
        // Fallback to product-derived categories when category endpoint is unavailable.
        setCategoryOptions([]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(async (product) => {
    setActionLoading(true);
    setError(null);
    try {
      const newProduct = await createProduct(product);
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      setError(err.message);
      console.error("Add error:", err);
      return null;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await editProduct(id, updates);
      setProducts((prev) =>
        prev.map((product) => (product.id === updated.id ? updated : product))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      console.error("Update error:", err);
      return null;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    setActionLoading(true);
    setError(null);
    try {
      await removeProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      console.error("Delete error:", err);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const uploadImages = useCallback(async (productId, images) => {
    setActionLoading(true);
    setError(null);
    try {
      return await uploadProductImages(productId, images);
    } catch (err) {
      setError(err.message);
      console.error("Image upload error:", err);
      return [];
    } finally {
      setActionLoading(false);
    }
  }, []);

  const deleteImages = useCallback(async (productId, imageIds) => {
    const safeIds = Array.isArray(imageIds)
      ? imageIds
          .map((id) => Number.parseInt(id, 10))
          .filter((id) => Number.isInteger(id) && id > 0)
      : [];

    if (safeIds.length === 0) {
      return true;
    }

    setActionLoading(true);
    setError(null);
    try {
      await Promise.all(safeIds.map((imageId) => removeProductImage(productId, imageId)));
      return true;
    } catch (err) {
      setError(err.message);
      console.error("Image delete error:", err);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const getProduct = useCallback(
    (id) => {
      return products.find((p) => p.id === id) || null;
    },
    [products]
  );

  const filteredProducts = products.filter((product) => {
    const primaryCategory = getPrimaryCategoryName(product);
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      primaryCategory === categoryFilter ||
      (Array.isArray(product.categories) &&
        product.categories.some((category) => category.name === categoryFilter));

    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;

    const matchesPrice = 
      (minPrice === "" || product.price >= parseFloat(minPrice)) &&
      (maxPrice === "" || product.price <= parseFloat(maxPrice));

    return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    inactive: products.filter((p) => p.status === "inactive").length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
  };

  return {
    products: filteredProducts,
    allProducts: products,
    categories:
      categoryOptions.length > 0
        ? categoryOptions
        : getCategoryNamesFromProducts(products),
    stats,
    loading,
    actionLoading,
    error,
    refreshProducts: fetchProducts,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImages,
    deleteImages,
    getProduct,
  };
}

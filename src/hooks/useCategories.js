import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "services/categoryService";

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err && err.message ? err.message : "Kategoriler alinamadi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const addCategory = useCallback(async (name) => {
    setActionLoading(true);
    setError("");
    try {
      const created = await createCategory({ name });
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "tr"))
      );
      return created;
    } catch (err) {
      setError(err && err.message ? err.message : "Kategori eklenemedi.");
      return null;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const editCategory = useCallback(async (id, name) => {
    setActionLoading(true);
    setError("");
    try {
      const updated = await updateCategory(id, { name });
      setCategories((prev) =>
        prev
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.name.localeCompare(b.name, "tr"))
      );
      return updated;
    } catch (err) {
      setError(err && err.message ? err.message : "Kategori guncellenemedi.");
      return null;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const removeCategory = useCallback(async (id) => {
    setActionLoading(true);
    setError("");
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      setError(err && err.message ? err.message : "Kategori silinemedi.");
      return false;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const stats = useMemo(
    () => ({
      total: categories.length,
      longNames: categories.filter((item) => item.name.length >= 12).length,
    }),
    [categories]
  );

  return {
    categories,
    stats,
    loading,
    actionLoading,
    error,
    refreshCategories,
    addCategory,
    editCategory,
    removeCategory,
  };
}

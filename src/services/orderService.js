import apiClient from "services/apiClient";

const ORDERS_ENDPOINT = "/api/orders";

export async function placeOrder(items) {
  const safeItems = Array.isArray(items)
    ? items
        .map((item) => ({
          productId: Number.parseInt(item && item.productId, 10),
          quantity: Number.parseInt(item && item.quantity, 10),
        }))
        .filter(
          (item) =>
            Number.isInteger(item.productId) &&
            item.productId > 0 &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        )
    : [];

  if (safeItems.length === 0) {
    throw new Error("Siparis olusturmak icin sepette gecerli urun olmali.");
  }

  return apiClient.post(ORDERS_ENDPOINT, { items: safeItems });
}

export async function getMyOrders() {
  const response = await apiClient.get(`${ORDERS_ENDPOINT}/my`);
  return Array.isArray(response) ? response : [];
}

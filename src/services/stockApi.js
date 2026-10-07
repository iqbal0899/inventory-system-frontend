import api from "./axiosApi";

export async function getStocks(params = {}) {
  const response = await api.get("/stock", {
    params,
  });

  return response.data;
}

export async function getStockByProductId(productId) {
  const response = await api.get(`/stock/${productId}`);

  return response.data;
}

export async function getStockMovements(params = {}) {
  const response = await api.get("/stock/movements", {
    params,
  });

  return response.data;
}

export async function stockIn(productId, data) {
  const response = await api.post(
    `/stock/${productId}/in`,
    data
  );

  return response.data;
}

export async function stockOut(productId, data) {
  const response = await api.post(
    `/stock/${productId}/out`,
    data
  );

  return response.data;
}

export async function adjustStock(productId, data) {
  const response = await api.patch(
    `/stock/${productId}/adjust`,
    data
  );

  return response.data;
}
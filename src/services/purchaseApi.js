import api from "./axiosApi";

export const getPurchases = async (params = {}) => {
  const response = await api.get("/purchases", {
    params,
  });

  return response;
};

export const getPurchaseById = async (id) => {
  const response = await api.get(`/purchases/${id}`);

  return response;
};

export const createPurchase = async (data) => {
  const { idempotencyKey, ...purchaseData } = data;

  if (!idempotencyKey) {
    throw new Error("Idempotency key wajib disertakan.");
  }

  const response = await api.post(
    "/purchases",
    purchaseData,
    {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    }
  );

  return response;
};

export const receivePurchase = async (id) => {
  const response = await api.patch(
    `/purchases/${id}/receive`
  );

  return response;
};

export const cancelPurchase = async (id, data) => {
  const response = await api.patch(
    `/purchases/${id}/cancel`,
    data
  );

  return response;
};

export const deletePurchase = async (id) => {
  const response = await api.delete(`/purchases/${id}`);

  return response;
};
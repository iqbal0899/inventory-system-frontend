import api from "./axiosApi";

export async function getRequests(params = {}) {
  const response = await api.get("/requests", {
    params,
  });

  return response.data;
}

export async function getRequestById(id) {
  const response = await api.get(`/requests/${id}`);

  return response.data;
}

export async function createRequest(data) {
  const response = await api.post("/requests", data);

  return response.data;
}

export async function approveRequest(id) {
  const response = await api.patch(
    `/requests/${id}/approve`
  );

  return response.data;
}

export async function rejectRequest(id, data = {}) {
  const response = await api.patch(
    `/requests/${id}/reject`,
    data
  );

  return response.data;
}

export async function deleteRequest(id) {
  const response = await api.delete(`/requests/${id}`);

  return response.data;
}
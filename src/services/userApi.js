import axiosApi from "./axiosApi";

export async function getUsers(params = {}) {
  const response = await axiosApi.get("/users", {
    params,
  });

  return response.data;
}

export async function getUserById(id) {
  const response = await axiosApi.get(`/users/${id}`);

  return response.data;
}

export async function createUser(data) {
  const response = await axiosApi.post("/users", data);

  return response.data;
}

export async function updateUser(id, data) {
  const response = await axiosApi.put(`/users/${id}`, data);

  return response.data;
}

export async function deleteUser(id) {
  const response = await axiosApi.delete(`/users/${id}`);

  return response.data;
}
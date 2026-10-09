
import axiosApi from "./axiosApi";

export async function login(username, password) {
  const response = await axiosApi.post("/auth/login", {
    username: username.trim(),
    password,
  });

  return response.data;
}

export async function getMe() {
  const response = await axiosApi.get("/auth/me");

  return response.data;
}

export async function logout() {
  const response = await axiosApi.post("/auth/logout");

  return response.data;
}
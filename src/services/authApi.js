
import axiosApi from "./axiosApi";

export async function login(username, password) {
  try {
    const response = await axiosApi.post("/auth/login", {
      username: username.trim(),
      password,
    });

    return response.data;
  } catch (error) {
    console.error("LOGIN ERROR RESPONSE:", {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
    });

    throw error;
  }
}

export async function getMe() {
  const response = await axiosApi.get("/auth/me");
  return response.data;
}

export async function logout() {
  const response = await axiosApi.post("/auth/logout");
  return response.data;
}

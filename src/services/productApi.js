
import axiosApi from "./axiosApi";

export async function getProducts() {
  try {
    const response = await axiosApi.get("/products");
    console.log("GET ACTIVE PRODUCTS:", response.data);
    return response.data;
  } catch (error) {
    console.error("GET ACTIVE PRODUCTS ERROR:", error);
    throw error;
  }
}

export async function getInactiveProducts() {
  try {
    const response = await axiosApi.get("/products/inactive");
    console.log("GET INACTIVE PRODUCTS:", response.data);
    return response.data;
  } catch (error) {
    console.error("GET INACTIVE PRODUCTS ERROR:", error);
    throw error;
  }
}

export async function getProductById(id) {
  try {
    const response = await axiosApi.get(`/products/${id}`);
    console.log("GET PRODUCT BY ID:", response.data);
    return response.data;
  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);
    throw error;
  }
}

export async function getNextProductCode() {
  try {
    const response = await axiosApi.get("/products/next-code");
    return response.data;
  } catch (error) {
    console.error("GET NEXT PRODUCT CODE ERROR:", error);
    throw error;
  }
}

export async function createProduct(data) {
  try {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("category", data.category || "");
    formData.append("price", String(data.price));
    formData.append("stock", String(data.stock || 0));
    formData.append("minStock", String(data.minStock || 0));
    formData.append("unit", data.unit || "pcs");
    formData.append("status", data.status || "ACTIVE");

    if (data.supplierId) {
      formData.append("supplierId", String(data.supplierId));
    }

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    console.log("CREATE PRODUCT FORM DATA:");

    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await axiosApi.post("/products", formData);

    console.log("CREATE PRODUCT RESPONSE:", response.data);
    return response.data;
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    console.error("STATUS:", error?.response?.status);
    console.error("RESPONSE:", error?.response?.data);
    throw error;
  }
}

export async function updateProduct(id, data) {
  try {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("category", data.category || "");
    formData.append("price", String(data.price));
    formData.append("stock", String(data.stock || 0));
    formData.append("minStock", String(data.minStock || 0));
    formData.append("unit", data.unit || "pcs");
    formData.append("status", data.status || "ACTIVE");

    if (data.supplierId) {
      formData.append("supplierId", String(data.supplierId));
    }

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    console.log("UPDATE PRODUCT FORM DATA:");

    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await axiosApi.put(`/products/${id}`, formData);

    console.log("UPDATE PRODUCT RESPONSE:", response.data);
    return response.data;
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    console.error("STATUS:", error?.response?.status);
    console.error("RESPONSE:", error?.response?.data);
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    console.log("SOFT DELETE PRODUCT:", id);

    const response = await axiosApi.delete(`/products/${id}`);

    console.log("SOFT DELETE RESPONSE:", response.data);
    return response.data;
  } catch (error) {
    console.error("SOFT DELETE PRODUCT ERROR:", error);
    console.error("STATUS:", error?.response?.status);
    console.error("RESPONSE:", error?.response?.data);
    throw error;
  }
}

export async function restoreProduct(id) {
  try {
    console.log("RESTORE PRODUCT:", id);

    const response = await axiosApi.patch(`/products/${id}/restore`);

    console.log("RESTORE PRODUCT RESPONSE:", response.data);
    return response.data;
  } catch (error) {
    console.error("RESTORE PRODUCT ERROR:", error);
    console.error("STATUS:", error?.response?.status);
    console.error("RESPONSE:", error?.response?.data);
    throw error;
  }
}

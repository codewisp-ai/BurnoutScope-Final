import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export async function analyzeBurnout(formData) {
  const response = await apiClient.post("/api/analyze", formData);
  return response.data;
}
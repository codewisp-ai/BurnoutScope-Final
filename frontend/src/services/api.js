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

export async function analyzeBehaviorPatterns(username, calendarData = null) {
  const params = {};
  if (calendarData) {
    params.calendarData = JSON.stringify(calendarData);
  }

  const response = await apiClient.get(`/api/analyze/${username}/patterns`, {
    params,
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
}
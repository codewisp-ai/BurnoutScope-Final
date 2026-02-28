import axios from "axios";
import { getToken } from "../utils/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── Multipart client — for file uploads (existing analyze routes) ────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "multipart/form-data" },
});

// ─── JSON client — for auth and user profile routes ───────────────────────────
const jsonClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every JSON request if available
jsonClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Attach JWT to multipart requests too (for /api/user/analyze)
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Existing public endpoints (unchanged) ────────────────────────────────────

export async function analyzeBurnout(formData) {
  const response = await apiClient.post("/api/analyze", formData);
  return response.data;
}

export async function analyzeBehaviorPatterns(username, calendarData = null) {
  const params = {};
  if (calendarData) params.calendarData = JSON.stringify(calendarData);
  const response = await apiClient.get(`/api/analyze/${username}/patterns`, {
    params,
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export async function registerUser({ email, password, githubUsername }) {
  const response = await jsonClient.post("/api/auth/register", {
    email, password, githubUsername,
  });
  return response.data; // { token, user }
}

export async function loginUser({ email, password }) {
  const response = await jsonClient.post("/api/auth/login", { email, password });
  return response.data; // { token, user }
}

// ─── Authenticated user endpoints ─────────────────────────────────────────────

export async function getUserProfile() {
  const response = await jsonClient.get("/api/user/profile");
  return response.data;
}

export async function updateGithubUsername(githubUsername) {
  const response = await jsonClient.put("/api/user/github", { githubUsername });
  return response.data;
}

// Authenticated analysis — uses stored githubUsername + optional calendar file
export async function analyzeBurnoutAuth(formData) {
  const response = await apiClient.post("/api/user/analyze", formData);
  return response.data;
}
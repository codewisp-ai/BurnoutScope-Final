// frontend/src/utils/auth.js
// Lightweight helpers for JWT management in localStorage.

const TOKEN_KEY = 'burnoutscope_token';
const USER_KEY = 'burnoutscope_user';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
};
export const setUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const removeUser = () => localStorage.removeItem(USER_KEY);

export const isLoggedIn = () => !!getToken();
// Add this to auth.js
export function waitForAuth() {
  return new Promise((resolve) => {
    // Give localStorage one tick to settle on cold loads
    setTimeout(() => resolve(!!getToken()), 0);
  });
}
export function logout() {
  removeToken();
  removeUser();
}
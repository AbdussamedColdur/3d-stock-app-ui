import apiClient from "services/apiClient";

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const AUTH_PROFILE_KEY = "auth_profile";
const REGISTER_ENDPOINT = process.env.REACT_APP_REGISTER_ENDPOINT || "/api/auth/register";
const LOGIN_ENDPOINT = process.env.REACT_APP_LOGIN_ENDPOINT || "/api/auth/login";
const REFRESH_ENDPOINT = process.env.REACT_APP_REFRESH_ENDPOINT || "/api/auth/refresh";
const LOGOUT_ENDPOINT = process.env.REACT_APP_LOGOUT_ENDPOINT || "/api/auth/logout";
const ME_ENDPOINT = process.env.REACT_APP_ME_ENDPOINT || "/api/auth/me";

function readString(values) {
  const found = values.find((item) => typeof item === "string" && item.trim());
  return found ? found.trim() : "";
}

function readTokens(response) {
  if (!response || typeof response !== "object") {
    return { accessToken: "", refreshToken: "" };
  }

  const accessToken = readString([
    response.token,
    response.accessToken,
    response.jwt,
    response.access_token,
    response.data && response.data.token,
    response.data && response.data.accessToken,
    response.data && response.data.jwt,
    response.data && response.data.access_token,
  ]);

  const refreshToken = readString([
    response.refreshToken,
    response.refresh_token,
    response.data && response.data.refreshToken,
    response.data && response.data.refresh_token,
  ]);

  return { accessToken, refreshToken };
}

function persistTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

function persistProfile(response) {
  if (!response || typeof response !== "object") {
    return;
  }

  const username = readString([
    response.username,
    response.user && response.user.username,
    response.data && response.data.username,
  ]);

  const email = readString([
    response.email,
    response.user && response.user.email,
    response.data && response.data.email,
  ]);

  const rolesSource =
    response.roles ||
    (response.user && response.user.roles) ||
    (response.data && response.data.roles) ||
    [];

  const roles = Array.isArray(rolesSource)
    ? rolesSource.filter((role) => typeof role === "string" && role.trim())
    : [];

  const profile = {
    username,
    email,
    roles,
  };

  localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
}

function clearTokens() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_PROFILE_KEY);
}

export function getStoredToken() {
  const raw = localStorage.getItem(AUTH_TOKEN_KEY);
  return typeof raw === "string" ? raw.trim() : "";
}

export function getStoredRefreshToken() {
  const raw = localStorage.getItem(REFRESH_TOKEN_KEY);
  return typeof raw === "string" ? raw.trim() : "";
}

export function getStoredProfile() {
  try {
    const raw = localStorage.getItem(AUTH_PROFILE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

export function getStoredRoles() {
  const profile = getStoredProfile();
  return Array.isArray(profile && profile.roles) ? profile.roles : [];
}

export function hasRole(role) {
  return getStoredRoles().includes(role);
}

export function isAuthenticated() {
  return Boolean(getStoredToken() || getStoredRefreshToken());
}

export async function register(payload) {
  const response = await apiClient.post(REGISTER_ENDPOINT, payload, { skipAuthRefresh: true });
  const tokens = readTokens(response);
  if (tokens.accessToken) {
    persistTokens(tokens);
    persistProfile(response);
  }

  return response;
}

export async function logout() {
  const refreshToken = getStoredRefreshToken();
  try {
    if (refreshToken) {
      await apiClient.post(
        LOGOUT_ENDPOINT,
        { refreshToken },
        { skipAuthRefresh: true }
      );
    }
  } catch (error) {
    // Ignore server-side logout failure and clear local tokens regardless.
  } finally {
    clearTokens();
  }
}

export async function login({ username, password }) {
  const safeUsername = typeof username === "string" ? username.trim() : "";
  const safePassword = typeof password === "string" ? password : "";

  if (!safeUsername || !safePassword) {
    throw new Error("Kullanici adi ve sifre zorunludur.");
  }

  const response = await apiClient.post(
    LOGIN_ENDPOINT,
    {
      usernameOrEmail: safeUsername,
      password: safePassword,
    },
    { skipAuthRefresh: true }
  );

  const tokens = readTokens(response);
  if (!tokens.accessToken) {
    throw new Error("Giris basarili ancak access token alinamadi.");
  }

  persistTokens(tokens);
  persistProfile(response);
  return {
    ...response,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

export async function refreshSession() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error("Refresh token bulunamadi.");
  }

  const response = await apiClient.post(
    REFRESH_ENDPOINT,
    { refreshToken },
    { skipAuthRefresh: true }
  );

  const tokens = readTokens(response);
  if (!tokens.accessToken) {
    throw new Error("Yeni access token alinamadi.");
  }

  persistTokens(tokens);
  persistProfile(response);
  return tokens;
}

export async function getCurrentUser() {
  const response = await apiClient.get(ME_ENDPOINT);
  persistProfile(response);
  return response;
}

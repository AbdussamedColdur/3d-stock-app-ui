const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.REACT_APP_API_TIMEOUT_MS, 10) || 15000;
const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const AUTH_PROFILE_KEY = "auth_profile";
const REFRESH_ENDPOINT = process.env.REACT_APP_REFRESH_ENDPOINT || "/api/auth/refresh";

let refreshPromise = null;

function sanitizeToken(token) {
  if (typeof token !== "string") return "";
  return token.replace(/[\r\n]/g, "").trim();
}

function sanitizeBody(payload) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(sanitizeBody);
  }

  return Object.keys(payload).reduce((result, key) => {
    if (key === "__proto__" || key === "prototype" || key === "constructor") {
      return result;
    }

    result[key] = sanitizeBody(payload[key]);
    return result;
  }, {});
}

function buildUrl(path) {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Prevent accidental /api/api/* when base URL already ends with /api.
  if (API_BASE_URL.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    normalizedPath = normalizedPath.slice(4);
  }

  if (API_BASE_URL.endsWith("/api") && normalizedPath === "/api") {
    normalizedPath = "";
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

async function request(path, options = {}) {
  const { headers, body, skipAuthRefresh = false, _retry = false, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const token = sanitizeToken(localStorage.getItem(AUTH_TOKEN_KEY));
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const safeBody = body !== undefined && !isFormData ? sanitizeBody(body) : body;

  try {
    const response = await fetch(buildUrl(path), {
      ...rest,
      credentials: "same-origin",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        "X-Requested-With": "XMLHttpRequest",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body:
        safeBody !== undefined
          ? isFormData
            ? safeBody
            : JSON.stringify(safeBody)
          : undefined,
    });

    if (!response.ok) {
      const refreshToken = sanitizeToken(localStorage.getItem(REFRESH_TOKEN_KEY));
      const isRefreshRequest = String(path).includes("/api/auth/refresh");
      if (
        response.status === 401 &&
        !skipAuthRefresh &&
        !_retry &&
        !isRefreshRequest &&
        refreshToken
      ) {
        const nextToken = await refreshAccessToken(refreshToken);
        if (nextToken) {
          return request(path, { ...options, _retry: true });
        }
      }

      let message = `Request failed with status ${response.status}`;

      try {
        const errorBody = await response.json();
        if (errorBody && typeof errorBody.message === "string") {
          message = errorBody.message;
        }
      } catch (parseError) {
        // Ignore JSON parse errors; keep generic message.
      }

      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  } catch (error) {
    if (error && error.name === "AbortError") {
      throw new Error("Istek zaman asimina ugradi. Lutfen tekrar deneyin.");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Beklenmeyen bir ag hatasi olustu.");
  } finally {
    clearTimeout(timeoutId);
  }
}

async function refreshAccessToken(refreshToken) {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(buildUrl(REFRESH_ENDPOINT), {
        method: "POST",
        credentials: "same-origin",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        return "";
      }

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : null;

      const nextAccessToken = sanitizeToken(
        payload &&
          (payload.accessToken ||
            payload.token ||
            payload.jwt ||
            payload.access_token ||
            (payload.data &&
              (payload.data.accessToken ||
                payload.data.token ||
                payload.data.jwt ||
                payload.data.access_token)))
      );

      const nextRefreshToken = sanitizeToken(
        payload &&
          (payload.refreshToken ||
            payload.refresh_token ||
            (payload.data && (payload.data.refreshToken || payload.data.refresh_token)))
      );

      if (!nextAccessToken) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        return "";
      }

      localStorage.setItem(AUTH_TOKEN_KEY, nextAccessToken);
      if (nextRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
      }

      if (payload && typeof payload === "object") {
        const roles = Array.isArray(payload.roles)
          ? payload.roles
          : Array.isArray(payload.data && payload.data.roles)
            ? payload.data.roles
            : [];
        const username =
          (typeof payload.username === "string" && payload.username) ||
          (payload.data && typeof payload.data.username === "string" && payload.data.username) ||
          "";

        localStorage.setItem(
          AUTH_PROFILE_KEY,
          JSON.stringify({ username, roles, email: "" })
        );
      }

      return nextAccessToken;
    } catch (error) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(AUTH_PROFILE_KEY);
      return "";
    } finally {
      clearTimeout(timeoutId);
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

const apiClient = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options = {}) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options = {}) => request(path, { ...options, method: "DELETE" }),
};

export default apiClient;

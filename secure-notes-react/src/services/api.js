import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("JWT_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    let csrfToken = localStorage.getItem("CSRF_TOKEN");
    if (!csrfToken) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/csrf-token`,
          { withCredentials: true }
        );
        csrfToken = response.data.token;
        localStorage.setItem("CSRF_TOKEN", csrfToken);
      } catch (error) {
        console.error("Failed to fetch CSRF token", error);
      }
    }

    if (csrfToken) {
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const clearStoredSession = () => {
  ["JWT_TOKEN", "USER", "CSRF_TOKEN", "IS_ADMIN"].forEach((key) =>
    localStorage.removeItem(key)
  );
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isPublicAuthCall = config?.url?.startsWith("/auth/public/");

    if (
      response?.status === 401 &&
      !isPublicAuthCall &&
      localStorage.getItem("JWT_TOKEN")
    ) {
      clearStoredSession();
      window.location.assign("/login");
    }

    if (response?.status === 403 && config && !config._csrfRetried) {
      config._csrfRetried = true;
      localStorage.removeItem("CSRF_TOKEN");
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;

// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem("token")}`,
//   },
// });

// export default axiosInstance;

// will NOT automatically update the token if it changes later (like after login or refresh), but it will work for the first request

// localStorage.getItem("token") is called once at the time of instance creation.

// If the token changes afterward (e.g., user logs in), the axiosInstance still uses the old token (or null if none was available at the time of creation).

// It won’t pick up new tokens dynamically on every request.

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Automatically attach the latest token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;

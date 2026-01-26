import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true // ✅ REQUIRED for cookie auth
});

export default axiosInstance;


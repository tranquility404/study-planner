import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

const authApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// authApiClient.interceptors.request.use(
  // (config) => {
  //   const token = localStorage.getItem("token"); // Retrieve token
  //   if (token) {
  //     config.headers.Authorization = `Bearer ${token}`;
  //   }
  //   return config;
  // },
  // (config) => {
  // if (config.method === "post" || config.method === "put") {
  //   const originalData = config.data || {};
    
    // config.data = {
    //   ...originalData,
    //   user_id: localStorage.getItem("token")
    // };
  // }
//   return config;
// }, (error) => Promise.reject(error)
// );

// Response interceptor for API calls
authApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // const message = error.response?.data?.message || 'An error occurred';
    // You can add global error handling here
    return Promise.reject(error);
  }
);

export default authApiClient;
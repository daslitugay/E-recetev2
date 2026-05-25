import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');

  if (userInfo) {
    try {
      const parsedUser = JSON.parse(userInfo);

      if (parsedUser?.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    } catch (error) {
      localStorage.removeItem('userInfo');
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    return Promise.reject(new Error(message));
  }
);

export default api;
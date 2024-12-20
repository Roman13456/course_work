import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,  // Adjust as needed
  timeout: 5000,  // Request timeout
});

const refreshAxios = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,  // Same baseURL as axiosClient
  timeout: 5000,  // Same timeout
});

// Request interceptor to attach access token from localStorage to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    console.log('appended token:', token)
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token expiration and refreshing
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is a 401 (Unauthorized) and if the request has already been retried
    //|| error.response.status === 403
    if (error.response && (error.response.status === 401 ) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Make a request to the refresh token endpoint (cookie will be sent automatically)
        const { data } = await refreshAxios.post('/refresh-token',{}, { withCredentials: true });  // No need to manually send the refresh token
        // Store new access token in localStorage
        localStorage.setItem('access_token', data.accessToken);
        console.log('token refreshed')

        // Update the original request with the new access token
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

        // Retry the original request
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // If the refresh token is expired or the refresh process fails, reject the promise
        console.log("refreshError", refreshError?.response.data.message)
        return Promise.reject(refreshError);
      }
    }
    
    // If any other error occurs, just return the error as usual
    return Promise.reject(error);
  }
);

export default axiosClient;



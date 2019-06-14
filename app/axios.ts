import axios from "axios";

const maxRequestCount = 10;
const intervalMS = 20;
let pendingRequests = 0;

const axiosInstance = axios.create({});


axiosInstance.interceptors.request.use(function (config) {
  return new Promise((resolve) => {
    let interval = setInterval(() => {
      if (pendingRequests < maxRequestCount) {
        pendingRequests++;
        clearInterval(interval);
        resolve(config);
      }
    }, intervalMS);
  });
});


axiosInstance.interceptors.response.use(function (response) {
    pendingRequests = Math.max(0, pendingRequests - 1);
    return Promise.resolve(response);
}, function (error) {
    pendingRequests = Math.max(0, pendingRequests - 1);
    return Promise.reject(error);
});
export default axiosInstance;
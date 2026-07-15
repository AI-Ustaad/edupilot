import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 15000,
});

// 🔥 PERMANENT FIX: نیٹ ورک ایررز کو ہینڈل کرنے کا انٹرسیپٹر
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. اگر انٹرنیٹ کنکشن ٹوٹ جائے یا سرور جواب نہ دے
    if (!error.response) {
      console.error("[Axios] Network Error: Internet disconnected or server unreachable");
      // ایسا ایرر ریٹرن کریں جو فرنٹ اینڈ آسانی سے پڑھ سکے
      return Promise.reject({ 
        response: { data: { error: "Network Error. Please check your internet connection." } } 
      });
    }
    
    // 2. اگر یوزر کا سیشن ختم ہو جائے (401 Unauthorized)
    if (error.response.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

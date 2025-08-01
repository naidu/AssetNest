import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        throw error;
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  async login(email, password) {
    const response = await this.api.post('/auth/login', { email, password });
    return response;
  }

  async register(userData) {
    const response = await this.api.post('/auth/register', userData);
    return response;
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response;
  }

  logout() {
    localStorage.removeItem('token');
    this.setAuthToken(null);
    window.location.href = '/login';
  }
}

export default new AuthService();

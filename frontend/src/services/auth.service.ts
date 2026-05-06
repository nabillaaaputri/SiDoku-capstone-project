import apiClient from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('authToken');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

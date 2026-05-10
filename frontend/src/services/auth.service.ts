import apiClient from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  storeName: string;
}

interface AuthResponse {
  status: string;
  message: string;
  data: {
    accessToken?: string;
    id?: string;
    email?: string;
    storeName?: string;
  };
}

export const authService = {
  // LOGIN
  login: async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );

    const token = response.data.data.accessToken;

    if (token) {
      localStorage.setItem('authToken', token);
    }

    return response.data;
  },

  // REGISTER
  register: async (
    credentials: RegisterCredentials
  ): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/register',
      credentials
    );

    return response.data;
  },

  // LOGOUT
  logout: (): void => {
    // hapus semua data local storage
    localStorage.clear();

    // redirect ke login
    window.location.href = '/login';
  },

  // GET CURRENT USER
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // CHECK AUTH
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};
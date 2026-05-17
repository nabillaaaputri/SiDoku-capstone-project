import { authApiClient } from './api';

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
  const response = await authApiClient.post<AuthResponse>(
    '/auth/login',
    credentials
  );

  console.log("FULL LOGIN RESPONSE:", response.data);

  const token = response.data.data.accessToken;

  console.log("TOKEN DARI BACKEND:", token);

  if (token) {
    localStorage.setItem('authToken', token);
  }

  return response.data;
},

  // REGISTER
  register: async (
    credentials: RegisterCredentials
  ): Promise<AuthResponse> => {
    const response = await authApiClient.post<AuthResponse>(
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
      const response = await authApiClient.get('/auth/me');
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
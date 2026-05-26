import axios from 'axios';
import apiClient, { authApiClient, clearStoredAuthTokens } from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  storeName: string;
  confirmPassword: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponseData {
  id: string;
  email: string;
  storeName: string;
}

interface ProfileResponseData {
  id: string;
  ownerName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
}

interface StoreAccountResponseData {
  id: string;
  storeName: string;
  storeCategory?: string;
  storeAddress?: string;
  storeDescription?: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  storeName?: string;
}

export const getPreferredUserName = (user?: Pick<CurrentUser, 'storeName' | 'name' | 'email'> | null) => {
  const storeName = user?.storeName?.trim();
  const name = user?.name?.trim();
  const emailPrefix = user?.email?.split('@')[0]?.trim();

  return storeName || name || emailPrefix || 'User';
};

const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const LAST_REGISTERED_STORE_KEY = 'sidokuLastRegisteredStore';
const LEGACY_SETTINGS_VALUES = new Set(['Pirak', 'Peara Store', 'pearastore@gmail.com']);

interface StoredRegisteredStore {
  email: string;
  storeName: string;
}

const getStoredRegisteredStore = (email: string) => {
  try {
    const raw = localStorage.getItem(LAST_REGISTERED_STORE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredRegisteredStore;

    if (!parsed?.email || parsed.email.toLowerCase() !== email.toLowerCase()) {
      return null;
    }

    const storeName = parsed.storeName?.trim();

    return storeName ? parsed : null;
  } catch {
    return null;
  }
};

const setStoredRegisteredStore = (email: string, storeName: string) => {
  localStorage.setItem(
    LAST_REGISTERED_STORE_KEY,
    JSON.stringify({ email, storeName }),
  );
};

const clearStoredRegisteredStore = (email: string) => {
  const stored = getStoredRegisteredStore(email);

  if (stored) {
    localStorage.removeItem(LAST_REGISTERED_STORE_KEY);
  }
};

const isLegacySettingValue = (value?: string | null) => {
  const normalizedValue = value?.trim();

  return !!normalizedValue && LEGACY_SETTINGS_VALUES.has(normalizedValue);
};

const syncLegacySettingsFromFrontend = async (
  profile: ProfileResponseData,
  storeAccount: StoreAccountResponseData,
) => {
  const storedRegisteredStore = getStoredRegisteredStore(profile.email);
  const emailPrefix = profile.email.split('@')[0]?.trim();
  const preferredStoreName = storedRegisteredStore?.storeName || emailPrefix || profile.ownerName || storeAccount.storeName || 'User';
  const needsSync = (
    isLegacySettingValue(profile.ownerName) ||
    isLegacySettingValue(profile.email) ||
    isLegacySettingValue(storeAccount.storeName)
  );

  if (!needsSync && profile.ownerName?.trim() === preferredStoreName && storeAccount.storeName?.trim() === preferredStoreName) {
    return preferredStoreName;
  }

  await Promise.all([
    apiClient.put<ApiResponse<ProfileResponseData>>('/settings/profile', {
      ownerName: preferredStoreName,
      email: profile.email,
      phoneNumber: profile.phoneNumber || '+62 812 3456 7890',
    }),
    apiClient.put<ApiResponse<StoreAccountResponseData>>('/settings/store-account', {
      storeName: preferredStoreName,
      storeCategory: storeAccount.storeCategory || 'Grosir',
      storeAddress: storeAccount.storeAddress || 'Jl. Danau Cikur 17, No. 15',
      storeDescription: storeAccount.storeDescription || 'Toko online yang menjual berbagai produk berkualitas dan original.',
    }),
  ]);

  clearStoredRegisteredStore(profile.email);

  return preferredStoreName;
};

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      fallbackMessage
    );
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
};

export const authService = {
  // LOGIN
  login: async (
    credentials: LoginCredentials,
  ): Promise<ApiResponse<LoginResponseData>> => {
    const response = await authApiClient.post<ApiResponse<LoginResponseData>>(
      '/auth/login',
      credentials,
    );

    const { accessToken, refreshToken } = response.data.data;

    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    return response.data;
  },

  // REGISTER
  register: async (
    credentials: RegisterCredentials,
  ): Promise<ApiResponse<RegisterResponseData>> => {
    const response = await authApiClient.post<ApiResponse<RegisterResponseData>>(
      '/auth/register',
      credentials,
    );

    setStoredRegisteredStore(credentials.email, credentials.storeName);

    return response.data;
  },

  updateProfile: async (
    payload: {
      ownerName: string;
      email: string;
      phoneNumber: string;
    },
  ): Promise<ApiResponse<ProfileResponseData>> => {
    const response = await apiClient.put<ApiResponse<ProfileResponseData>>('/settings/profile', payload);

    return response.data;
  },

  updateStoreAccount: async (
    payload: {
      storeName: string;
      storeCategory: string;
      storeAddress: string;
      storeDescription: string;
    },
  ): Promise<ApiResponse<StoreAccountResponseData>> => {
    const response = await apiClient.put<ApiResponse<StoreAccountResponseData>>('/settings/store-account', payload);

    return response.data;
  },

  refreshAccessToken: async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      return null;
    }

    const response = await authApiClient.put<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh',
      { refreshToken },
    );

    const accessToken = response.data.data.accessToken;

    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    return accessToken || null;
  },

  // LOGOUT
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    try {
      if (refreshToken) {
        await authApiClient.post<ApiResponse<null>>('/auth/logout', {
          refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearStoredAuthTokens();
    }
  },

  // GET CURRENT USER
  getCurrentUser: async (): Promise<CurrentUser | null> => {
    try {
      const [profileResponse, storeAccountResponse] = await Promise.all([
        apiClient.get<ApiResponse<ProfileResponseData>>('/settings/profile'),
        apiClient.get<ApiResponse<StoreAccountResponseData>>('/settings/store-account'),
      ]);

      const profile = profileResponse.data.data;
      const storeAccount = storeAccountResponse.data.data;
      const normalizedStoreName = await syncLegacySettingsFromFrontend(profile, storeAccount);

      return {
        id: profile.id,
        email: profile.email,
        name: normalizedStoreName || profile.ownerName || profile.email.split('@')[0] || 'User',
        storeName: normalizedStoreName || storeAccount.storeName,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      clearStoredAuthTokens();
      return null;
    }
  },

  getErrorMessage: (error: unknown, fallbackMessage = 'Terjadi kesalahan pada server.') => {
    return getApiErrorMessage(error, fallbackMessage);
  },

  // CHECK AUTH
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};
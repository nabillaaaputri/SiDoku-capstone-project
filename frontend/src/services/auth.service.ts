import axios from 'axios';
import apiClient, {
  authApiClient,
  clearStoredAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  persistAuthToken,
} from './api';

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

interface AuthMeResponseData {
  id: string;
  email: string;
  storeName?: string;
}

const getSafeProfileImagePayload = (profileImage?: string | null) => {
  const normalized = profileImage?.trim();

  if (!normalized) {
    return 'https://via.placeholder.com/256?text=SiDoku';
  }

  return normalized;
};

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  storeName?: string;
  profileImage?: string;
}

export const getPreferredUserName = (user?: Pick<CurrentUser, 'storeName' | 'name' | 'email'> | null) => {
  const storeName = user?.storeName?.trim();
  const name = user?.name?.trim();

  return name || storeName || 'User';
};

const ACCESS_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const LAST_REGISTERED_STORE_KEY = 'sidokuLastRegisteredStore';
const LEGACY_SETTINGS_VALUES = new Set(['Pirak', 'Peara Store', 'pearastore@gmail.com']);

const isAuthHttpError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return [401, 403].includes(error.response?.status ?? 0);
};

const refreshStoredAccessToken = async (): Promise<string | null> => {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const response = await authApiClient.put<ApiResponse<{ accessToken: string }>>(
    '/auth/refresh',
    { refreshToken },
  );

  const accessToken = response.data.data.accessToken;

  if (accessToken) {
    persistAuthToken(ACCESS_TOKEN_KEY, accessToken);
  }

  return accessToken || null;
};

const resolveSessionIdentity = async (): Promise<AuthMeResponseData | null> => {
  let accessToken = getStoredAccessToken();
  const hasRefreshToken = !!getStoredRefreshToken();

  if (!accessToken && !hasRefreshToken) {
    return null;
  }

  try {
    if (!accessToken && hasRefreshToken) {
      accessToken = await refreshStoredAccessToken() || undefined;
    }

    if (!accessToken) {
      return null;
    }

    const sessionIdentity = getStoredSessionIdentity();

    if (!sessionIdentity) {
      clearStoredAuthTokens();
      return null;
    }

    return {
      id: sessionIdentity.id,
      email: sessionIdentity.email,
    };
  } catch (error) {
    if (isAuthHttpError(error)) {
      clearStoredAuthTokens();
      return null;
    }

    const sessionIdentity = getStoredSessionIdentity();

    if (!sessionIdentity) {
      clearStoredAuthTokens();
      return null;
    }

    return {
      id: sessionIdentity.id,
      email: sessionIdentity.email,
    };
  }
};

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
  const preferredStoreName = storedRegisteredStore?.storeName || profile.ownerName || storeAccount.storeName || 'User';
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
      profileImage: getSafeProfileImagePayload(profile.profileImage),
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

const decodeJwtPayload = (token: string) => {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = atob(paddedBase64);

    return JSON.parse(decoded) as { id?: string; email?: string };
  } catch {
    return null;
  }
};

export const getStoredSessionIdentity = () => {
  const accessToken = getStoredAccessToken();
  const refreshToken = getStoredRefreshToken();
  const token = accessToken || refreshToken;

  if (!token) {
    return null;
  }

  const decoded = decodeJwtPayload(token);

  if (!decoded?.id || !decoded.email) {
    return null;
  }

  return decoded;
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

    console.log('login response', response.data);

    const { accessToken, refreshToken } = response.data.data;

    if (accessToken) {
      persistAuthToken(ACCESS_TOKEN_KEY, accessToken);
    }

    if (refreshToken) {
      persistAuthToken(REFRESH_TOKEN_KEY, refreshToken);
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
      profileImage?: string;
    },
  ): Promise<ApiResponse<ProfileResponseData>> => {
    const response = await apiClient.put<ApiResponse<ProfileResponseData>>('/settings/profile', {
      ...payload,
      profileImage: getSafeProfileImagePayload(payload.profileImage),
    });

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

  updatePassword: async (
    payload: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    },
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>('/settings/password', payload);

    return response.data;
  },

  refreshAccessToken: async (): Promise<string | null> => {
    return refreshStoredAccessToken();
  },

  validateStoredSession: async (): Promise<boolean> => {
    try {
      return !!(await resolveSessionIdentity());
    } catch {
      clearStoredAuthTokens();
      return false;
    }
  },

  // LOGOUT
  logout: async (): Promise<void> => {
    const refreshToken = getStoredRefreshToken();

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
      const authMe = await resolveSessionIdentity();

      if (!authMe) {
        return null;
      }

      let profile: ProfileResponseData | null = null;
      let storeAccount: StoreAccountResponseData | null = null;
      let normalizedStoreName = authMe.storeName || '';

      try {
        const [profileResponse, storeAccountResponse] = await Promise.all([
          apiClient.get<ApiResponse<ProfileResponseData>>('/settings/profile'),
          apiClient.get<ApiResponse<StoreAccountResponseData>>('/settings/store-account'),
        ]);

        profile = profileResponse.data.data;
        storeAccount = storeAccountResponse.data.data;

        try {
          normalizedStoreName = await syncLegacySettingsFromFrontend(profile, storeAccount);
        } catch (syncError) {
          console.error('Legacy settings sync failed:', syncError);
        }
      } catch (settingsError) {
        if (isAuthHttpError(settingsError)) {
          clearStoredAuthTokens();
          return null;
        }

        console.error('Profile/store account fetch failed:', settingsError);

        return {
          id: authMe.id,
          email: authMe.email,
          name: authMe.storeName || authMe.email || 'User',
          storeName: authMe.storeName,
        };
      }

      return {
        id: authMe.id || profile?.id || '',
        email: authMe.email || profile?.email || '',
        name: normalizedStoreName || profile?.ownerName || storeAccount?.storeName || authMe.storeName || 'User',
        storeName: normalizedStoreName || storeAccount?.storeName || authMe.storeName,
        profileImage: profile?.profileImage,
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
    return !!(getStoredAccessToken() || getStoredRefreshToken());
  },
};
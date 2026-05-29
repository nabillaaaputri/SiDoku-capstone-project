import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, getStoredSessionIdentity } from '@/services/auth.service';
import { clearStoredAuthTokens } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  storeName?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, storeName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const hasStoredSession = authService.isAuthenticated();
      setHasSession(hasStoredSession);

      if (hasStoredSession) {
        try {
          const currentUser = await authService.getCurrentUser();
          if (!isMounted) {
            return;
          }

          setHasSession(authService.isAuthenticated());
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          clearStoredAuthTokens();
          if (isMounted) {
            setUser(null);
            setHasSession(false);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setHasSession(false);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    const handleAuthInvalidated = () => {
      if (!isMounted) {
        return;
      }

      setUser(null);
      setHasSession(false);
      setIsLoading(false);
    };

    window.addEventListener('sidoku-auth-invalidated', handleAuthInvalidated);
    checkAuth();

    return () => {
      isMounted = false;
      window.removeEventListener('sidoku-auth-invalidated', handleAuthInvalidated);
    };
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login({ email, password });

    const currentUser = await authService.getCurrentUser();
    const sessionIdentity = getStoredSessionIdentity();

    setHasSession(authService.isAuthenticated());

    if (currentUser) {
      setUser(currentUser);
      return;
    }

    if (sessionIdentity) {
      setHasSession(true);
      setUser({
        id: sessionIdentity.id,
        email: sessionIdentity.email,
        name: email,
      });

      return;
    }

    setUser({
      id: '',
      email,
      name: 'User',
    });
  };

  const register = async (name: string, email: string, password: string, storeName?: string) => {
    await authService.register({
      email,
      password,
      storeName: storeName || name,
      confirmPassword: password,
    });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setHasSession(false);
  };

  const refreshUser = async () => {
    const hasStoredSession = authService.isAuthenticated();

    if (!hasStoredSession) {
      setUser(null);
      setHasSession(false);
      return;
    }

    const currentUser = await authService.getCurrentUser();
    setHasSession(authService.isAuthenticated());
    setUser(currentUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: hasSession,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

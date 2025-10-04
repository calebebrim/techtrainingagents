import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
  useEffect
} from 'react';
import { gql } from '@apollo/client';
import { User, UserRole } from '../types';
import client, { backendBaseUrl } from '../apollo';
import { AUTH_TOKEN_STORAGE_KEY } from '../constants/auth';

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface RawOrganization {
  id: string;
  name?: string | null;
}

interface RawGroup {
  id: string;
}

interface RawUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  roles?: string[];
  status?: string | null;
  themePreference?: string | null;
  organization?: RawOrganization | null;
  groups?: Array<RawGroup> | null;
}

interface MeQueryResult {
  me: RawUser | null;
}

interface GoogleAuthResponse {
  token: string;
  user: RawUser;
}

interface GoogleCodeResponse {
  code?: string;
  error?: string;
  error_description?: string;
}

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      avatarUrl
      roles
      status
      themePreference
      organization {
        id
        name
      }
      groups {
        id
      }
    }
  }
`;

const mapRoles = (roles: string[] = []): UserRole[] => {
  const validRoles = Object.values(UserRole) as string[];
  return roles.filter((role): role is UserRole => validRoles.includes(role));
};

const transformUser = (rawUser?: RawUser | null): User | null => {
  if (!rawUser) {
    return null;
  }

  return {
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    avatarUrl: rawUser.avatarUrl ?? null,
    roles: mapRoles(rawUser.roles ?? []),
    organizationId: rawUser.organization?.id ?? '',
    organizationName: rawUser.organization?.name,
    status: rawUser.status,
    themePreference: rawUser.themePreference,
    groups: rawUser.groups?.map((group) => group.id) ?? []
  };
};

const authEndpoint = backendBaseUrl ? `${backendBaseUrl}/auth/google` : '/auth/google';

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to read auth token from storage', error);
    return null;
  }
};

const storeToken = (token: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.warn('Unable to persist auth token', error);
  }
};

const clearStoredToken = () => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear auth token from storage', error);
  }
};

let googleSdkPromise: Promise<typeof window.google> | null = null;

const loadGoogleSdk = async (): Promise<typeof window.google> => {
  if (googleSdkPromise) {
    return googleSdkPromise;
  }

  googleSdkPromise = new Promise<typeof window.google>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google SDK is not available in this environment.'));
      return;
    }

    const resolveIfReady = () => {
      if (window.google?.accounts?.oauth2) {
        resolve(window.google);
        return true;
      }
      return false;
    };

    if (resolveIfReady()) {
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      if (resolveIfReady()) {
        return;
      }
      existingScript.addEventListener('load', () => {
        if (!resolveIfReady()) {
          reject(new Error('Google SDK failed to initialize.'));
        }
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('Failed to load the Google SDK.'));
      });
      // Fallback in case the script finished loading between these checks.
      setTimeout(() => {
        resolveIfReady();
      }, 0);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!resolveIfReady()) {
        reject(new Error('Google SDK failed to initialize.'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load the Google SDK.'));
    };
    document.head.appendChild(script);
  }).catch((error) => {
    googleSdkPromise = null;
    throw error;
  });

  return googleSdkPromise;
};

const requestGoogleAuthorizationCode = async (clientId: string): Promise<string> => {
  const google = await loadGoogleSdk();

  return new Promise<string>((resolve, reject) => {
    try {
      const codeClient = google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: (response: GoogleCodeResponse) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          if (!response.code) {
            reject(new Error('Google did not return an authorization code.'));
            return;
          }
          resolve(response.code);
        }
      });

      codeClient.requestCode();
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Failed to initiate Google authentication.'));
    }
  });
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    const { data } = await client.query<MeQueryResult>({
      query: ME_QUERY,
      fetchPolicy: 'network-only'
    });
    const mappedUser = transformUser(data?.me);
    setUser(mappedUser);
    return mappedUser;
  }, []);

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim();

  const login = useCallback(async () => {
    if (!googleClientId) {
      throw new Error('Google client ID is not configured.');
    }

    setLoading(true);
    try {
      const authorizationCode = await requestGoogleAuthorizationCode(googleClientId);

      const response = await fetch(authEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: authorizationCode })
      });

      const payload = (await response.json().catch(() => ({}))) as Partial<GoogleAuthResponse> & { error?: string };

      if (!response.ok) {
        const message = payload?.error || 'Failed to authenticate with Google.';
        throw new Error(message);
      }

      if (!payload?.token) {
        throw new Error('Received an invalid authentication response from the server.');
      }

      storeToken(payload.token);

      const optimisticUser = transformUser(payload.user);
      if (optimisticUser) {
        setUser(optimisticUser);
      }

      await fetchCurrentUser();
    } catch (error) {
      clearStoredToken();
      setUser(null);
      console.error('Google login failed', error);
      throw error instanceof Error ? error : new Error('Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentUser, googleClientId]);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    client.clearStore().catch((error) => {
      console.warn('Failed to clear Apollo cache on logout', error);
    });
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchCurrentUser()
      .catch((error) => {
        console.error('Failed to restore session', error);
        clearStoredToken();
        setUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fetchCurrentUser]);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

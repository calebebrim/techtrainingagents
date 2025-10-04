import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import { AUTH_TOKEN_STORAGE_KEY } from './constants/auth';

const { VITE_BACKEND_URL } = import.meta.env;
const LOCAL_DEFAULT = import.meta.env.DEV ? 'http://localhost:4000' : '';

const ensureProtocol = (value: string): string => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (value.startsWith('//')) {
    return `${window.location.protocol}${value}`;
  }
  if (value.startsWith(':')) {
    return `${window.location.protocol}//${window.location.hostname}${value}`;
  }
  if (value.startsWith('/')) {
    return `${window.location.origin}${value}`;
  }
  return `http://${value}`;
};

const rawBackendUrl = (VITE_BACKEND_URL && VITE_BACKEND_URL.trim()) || LOCAL_DEFAULT;
let normalizedBackendUrl = rawBackendUrl
  ? ensureProtocol(rawBackendUrl).replace(/\/$/, '')
  : '';

if (import.meta.env.DEV && normalizedBackendUrl.startsWith('https://localhost')) {
  console.warn(
    '[apollo] Detected https://localhost backend URL. The backend dev server typically runs over HTTP; switching to http://localhost to avoid SSL issues.'
  );
  normalizedBackendUrl = normalizedBackendUrl.replace('https://', 'http://');
}

export const backendBaseUrl = normalizedBackendUrl;

const httpLink = new HttpLink({
  uri: normalizedBackendUrl ? `${normalizedBackendUrl}/graphql` : '/graphql',
});

const authLink = setContext((_, { headers }) => {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    } catch (error) {
      console.warn('Unable to access localStorage for auth token', error);
    }
  }

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;

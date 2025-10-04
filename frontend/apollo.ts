import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
const { VITE_BACKEND_URL } = import.meta.env;
const normalizedBackendUrl = VITE_BACKEND_URL?.replace(/\/$/, '') ?? '';

const httpLink = new HttpLink({
  uri: normalizedBackendUrl ? `${normalizedBackendUrl}/graphql` : '/graphql',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;

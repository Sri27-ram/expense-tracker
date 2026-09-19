import client from './client';

export function login(username, password) {
  return client.post('/api/auth/login', { username, password }).then((res) => res.data);
}

export function register(username, email, password) {
  return client.post('/api/auth/register', { username, email, password }).then((res) => res.data);
}

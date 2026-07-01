import client from './client';

export const signup = async (name, email, password) => {
  const response = await client.post('/auth/signup', { name, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await client.post('/auth/login', { email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await client.get('/auth/me');
  return response.data;
};

export const loginWithGoogle = async (idToken) => {
  const response = await client.post('/auth/google', { id_token: idToken });
  return response.data;
};

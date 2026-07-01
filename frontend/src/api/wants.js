import client from './client';

export const listWants = async (limit = 50, offset = 0, category = null) => {
  const params = { limit, offset };
  if (category) params.category = category;
  const response = await client.get('/wants', { params });
  return response.data;
};

export const createWant = async (title, category, tags, description) => {
  const response = await client.post('/wants', { title, category, tags, description });
  return response.data;
};

export const updateWant = async (id, data) => {
  const response = await client.patch(`/wants/${id}`, data);
  return response.data;
};

export const deleteWant = async (id) => {
  const response = await client.delete(`/wants/${id}`);
  return response.data;
};

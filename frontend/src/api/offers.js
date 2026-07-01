import client from './client';

export const listOffers = async (limit = 50, offset = 0, category = null) => {
  const params = { limit, offset };
  if (category) params.category = category;
  const response = await client.get('/offers', { params });
  return response.data;
};

export const createOffer = async (title, category, tags, description) => {
  const response = await client.post('/offers', { title, category, tags, description });
  return response.data;
};

export const updateOffer = async (id, data) => {
  const response = await client.patch(`/offers/${id}`, data);
  return response.data;
};

export const deleteOffer = async (id) => {
  const response = await client.delete(`/offers/${id}`);
  return response.data;
};

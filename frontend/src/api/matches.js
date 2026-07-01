import client from './client';

export const listMatches = async (limit = 50, offset = 0) => {
  const response = await client.get('/matches', { params: { limit, offset } });
  return response.data;
};

export const updateMatchStatus = async (id, status) => {
  const response = await client.patch(`/matches/${id}/status`, { status });
  return response.data;
};

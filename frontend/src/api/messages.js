import client from './client';

export const listMessages = async (matchId, limit = 50, offset = 0) => {
  const response = await client.get(`/matches/${matchId}/messages`, { params: { limit, offset } });
  return response.data;
};

export const sendMessage = async (matchId, body) => {
  const response = await client.post(`/matches/${matchId}/messages`, { body });
  return response.data;
};

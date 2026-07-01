import client from './client';

export const createReview = async (matchId, rating, comment) => {
  const response = await client.post(`/reviews/${matchId}`, { rating, comment });
  return response.data;
};

export const getUserReviews = async (userId) => {
  const response = await client.get(`/reviews/user/${userId}`);
  return response.data;
};

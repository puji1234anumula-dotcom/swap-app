import client from './client';

export const listNotifications = async (limit = 50, offset = 0) => {
  const response = await client.get('/notifications', { params: { limit, offset } });
  return response.data;
};

export const markRead = async (notificationId) => {
  const response = await client.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

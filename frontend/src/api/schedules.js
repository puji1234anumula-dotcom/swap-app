import client from './client';

export const createSchedule = async (matchId, scheduledAt) => {
  const response = await client.post('/schedules', { match_id: matchId, scheduled_at: scheduledAt });
  return response.data;
};

export const getMatchSchedules = async (matchId) => {
  const response = await client.get(`/schedules/match/${matchId}`);
  return response.data;
};

export const acceptSchedule = async (scheduleId) => {
  const response = await client.put(`/schedules/${scheduleId}/accept`);
  return response.data;
};

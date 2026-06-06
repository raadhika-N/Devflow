import axiosInstance from '../lib/axios';

export const getActivityApi = async (projectId) => {
  const response = await axiosInstance.get(`/projects/${projectId}/activity`);
  return response.data;
};
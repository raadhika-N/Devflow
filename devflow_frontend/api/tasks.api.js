import axiosInstance from '../lib/axios';

export const getTasksApi = async (projectId, params = {}) => {
  const response = await axiosInstance.get(`/projects/${projectId}/tasks`, { params });
  return response.data;
};

export const createTaskApi = async (projectId, data) => {
  const response = await axiosInstance.post(`/projects/${projectId}/tasks`, data);
  return response.data;
};

export const updateTaskApi = async (projectId, taskId, data) => {
  const response = await axiosInstance.patch(`/projects/${projectId}/tasks/${taskId}`, data);
  return response.data;
};

export const deleteTaskApi = async (projectId, taskId) => {
  const response = await axiosInstance.delete(`/projects/${projectId}/tasks/${taskId}`);
  return response.data;
};
import axiosInstance from '../lib/axios';

export const getCommentsApi = async (projectId, taskId) => {
  const response = await axiosInstance.get(
    `/projects/${projectId}/tasks/${taskId}/comments`
  );
  return response.data;
};

export const addCommentApi = async (projectId, taskId, text) => {
  const response = await axiosInstance.post(
    `/projects/${projectId}/tasks/${taskId}/comments`,
    { text }
  );
  return response.data;
};

export const deleteCommentApi = async (projectId, taskId, commentId) => {
  const response = await axiosInstance.delete(
    `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`
  );
  return response.data;
};
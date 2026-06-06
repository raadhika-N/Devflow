import axiosInstance from '../lib/axios';

export const askAIApi = async (projectId, question) => {
  const response = await axiosInstance.post(
    `/projects/${projectId}/ai/ask`,
    { question }
  );
  return response.data;
};

export const getSprintSummaryApi = async (projectId) => {
  const response = await axiosInstance.post(
    `/projects/${projectId}/ai/summary`
  );
  return response.data;
};
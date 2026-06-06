import axiosInstance from '../lib/axios';

export const getProjectsApi = async () => {
  const response = await axiosInstance.get('/projects');
  return response.data;
};

export const createProjectApi = async (title, description) => {
  const response = await axiosInstance.post('/projects', { title, description });
  return response.data;
};

export const getProjectApi = async (id) => {
  const response = await axiosInstance.get(`/projects/${id}`);
  return response.data;
};

export const deleteProjectApi = async (id) => {
  const response = await axiosInstance.delete(`/projects/${id}`);
  return response.data;
};

export const addMemberApi = async (projectId, email) => {
  const response = await axiosInstance.post(`/projects/${projectId}/members`, { email });
  return response.data;
};

export const removeMemberApi = async (projectId, email) => {
  const response = await axiosInstance.delete(`/projects/${projectId}/members`, {
    data: { email }
  });
  return response.data;
};
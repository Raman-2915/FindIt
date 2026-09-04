import api from "./api";

export const getMyFoundItems = async () => {
  const response = await api.get("/found-items/my");
  return response.data;
};

export const getFoundItems = async (params?: {
  categoryId?: string;
  location?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get("/found-items", { params });
  return response.data;
};

export const getFoundItemById = async (id: string) => {
  const response = await api.get(`/found-items/${id}`);
  return response.data;
};

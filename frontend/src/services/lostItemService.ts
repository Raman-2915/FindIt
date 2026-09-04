import api from "./api";

export const getMyLostItems = async () => {
  const response = await api.get("/lost-items/my");
  return response.data;
};

export const getLostItems = async (params?: {
  categoryId?: string;
  location?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get("/lost-items", { params });
  return response.data;
};

export const getLostItemById = async (id: string) => {
  const response = await api.get(`/lost-items/${id}`);
  return response.data;
};

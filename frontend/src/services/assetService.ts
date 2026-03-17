import { Asset, CreateAssetDto, UpdateAssetDto } from '../types/asset';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const assetService = {
  getAll: async (): Promise<Asset[]> => {
    const response = await fetch(`${API_URL}/assets`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch assets');
    return response.json();
  },

  getById: async (id: string): Promise<Asset> => {
    const response = await fetch(`${API_URL}/assets/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch asset');
    return response.json();
  },

  create: async (data: CreateAssetDto): Promise<Asset> => {
    const response = await fetch(`${API_URL}/assets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create asset');
    return response.json();
  },

  update: async (id: string, data: UpdateAssetDto): Promise<Asset> => {
    const response = await fetch(`${API_URL}/assets/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update asset');
    return response.json();
  },

  remove: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/assets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete asset');
  },
};

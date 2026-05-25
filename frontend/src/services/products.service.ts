import apiClient from './api';

export interface Product {
  id: string;
  productName: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  margin: number;
  stock: number;
  minimumStock: number;
  stockStatus: 'low' | 'safe';
  isArchived: boolean;
}

export interface CreateProductPayload {
  productName: string;
  purchasePrice: number;
  sellingPrice: number;
  minimumStock: number;
  category: string;
  unit: string;
  initialStock: number;
}

export interface UpdateProductPayload {
  productName: string;
  purchasePrice: number;
  sellingPrice: number;
  minimumStock: number;
  category: string;
  unit: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const productService = {
  // Get all products
  getAll: async () => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products');
    return response.data;
  },

  // Get single product
  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  // Create product
  create: async (product: CreateProductPayload) => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', product);
    return response.data;
  },

  // Update product
  update: async (id: string, product: UpdateProductPayload) => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, product);
    return response.data;
  },

  archive: async (id: string) => {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/archive`);
    return response.data;
  },

  restore: async (id: string) => {
    const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/restore`);
    return response.data;
  },

  // Delete product
  delete: async (id: string) => {
    await apiClient.delete(`/products/${id}`);
  },

  getCategories: async () => {
    const response = await apiClient.get<ApiResponse<string[]>>('/products/categories');
    return response.data;
  },
};

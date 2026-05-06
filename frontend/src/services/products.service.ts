import apiClient from './api';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

export const productService = {
  // Get all products
  getAll: async () => {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  },

  // Get single product
  getById: async (id: string) => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Create product
  create: async (product: Omit<Product, 'id'>) => {
    const response = await apiClient.post<Product>('/products', product);
    return response.data;
  },

  // Update product
  update: async (id: string, product: Partial<Product>) => {
    const response = await apiClient.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  // Delete product
  delete: async (id: string) => {
    await apiClient.delete(`/products/${id}`);
  },
};

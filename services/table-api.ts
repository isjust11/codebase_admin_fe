import axios from 'axios';
import { Table } from '@/types/table';
import axiosApi from './base/api';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

interface PaginationParams {
  page?: number;
  size?: number;
  search?: string;
}

export const getTables = async (params?: PaginationParams): Promise<PaginatedResponse<Table>> => {
  try {
    const response = await axiosApi.get(`/table`, {params} );
    return response.data;
  } catch (_error) {
    console.error('Error fetching tables:', _error);
    return { data: [], total: 0, page: 0, size: 10 };
  }
};

export const getAllTables = async () => {
  try {
    const response = await axiosApi.get(`/table/all`,);
    return response.data;
  } catch (_error) {
    console.error('Error fetching tables:', _error);
  }
};

export const createTable = async (tableData: any): Promise<Table> => {
  try {
    const response = await axiosApi.post(`/table`, tableData);
    return response.data;
  } catch (_error) {
    console.error('Error creating table:', _error);
    throw _error;
  }
};

export const updateTable = async (id: number, tableData: any): Promise<Table> => {
  try {
    const response = await axiosApi.put(`/table/${id}`, tableData);
    return response.data;
  } catch (_error) {
    console.error('Error updating table:', _error);
    throw _error;
  }
};

export const deleteTable = async (id: number): Promise<void> => {
  try {
    await axiosApi.delete(`/table/${id}`);
  } catch (_error) {
    console.error('Error deleting table:', _error);
    throw _error;
  }
};

export const getTableById = async (id: string): Promise<Table> => {
  try {
    const response = await axiosApi.get(`/table/${id}`);
    return response.data;
  } catch (_error) {
    console.error('Error fetching table:', _error);
    throw _error;
  }
}; 
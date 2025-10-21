import { Order } from '@/types/order';
import { axiosInstance } from '@/lib/axios';
import { CreateFoodItemDto, FoodItem } from '@/types/food-item';
import { CreateOrderDto } from '@/types/dto/CreateOrderDto';
import { Permission } from '@/types/permission';
import { CategoryType } from '@/types/category-type';
import { Table } from '@/types/table';
import { Feature } from '@/types/feature';
import { Category } from '@/types/category';
import { DataSource, DataSourceTypeOption } from '@/types/data-source';


// todo: api manager fooditem
export const getAllFoods = async (params?: PaginationParams) : Promise<PaginatedResponse<FoodItem>> => {
  try {
    const response = await axiosInstance.get(`/food-items`, {params});
    return response.data;
  } catch (_error) {
    console.error('Error fetching food item:', _error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const createFoodItem = async (data: CreateFoodItemDto): Promise<FoodItem> => {
  try {
    const response = await axiosInstance.post(`/food-items`, data);
    return response.data;
  } catch (_error) {
    console.error('Error creating foodItem:', _error);
    throw _error; 
  }
};

export const updateFoodItem = async (id: number, data: any): Promise<FoodItem> => {
  try {
    const response = await axiosInstance.patch(`/food-items/${id}`, data);
    return response.data;
  } catch (_error) {
    console.error('Error updating table:', _error);
    throw _error;
  }
};

export const deleteFoodItem = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/food-items/${id}`);
  } catch (_error) {
    console.error('Error deleting table:', _error);
    throw _error;
  }
};

export const getFoodItem = async (id: number): Promise<FoodItem> => {
  try {
    const response = await axiosInstance.get(`/food-items/${id}`);
    return response.data;
  } catch (_error) {
    console.error('Error fetching food item:', _error);
    throw _error;
  }
}; 

// todo: api manager order
export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await axiosInstance.get(`/orders`);
    return response.data;
  } catch (_error) {
    console.error('Error fetching orders:', _error);
    throw _error;
  }
};

export const createOrder = async (tableId: any,data: CreateOrderDto): Promise<Order> => {
  try {
    const response = await axiosInstance.post(`/orders/${tableId}`, data);
    return response.data;
  } catch (_error) {
    console.error('Error creating order:', _error);
    throw _error;
  }
};

export const updateOrder = async (id: number, data: any): Promise<Order> => {
  try {
    const response = await axiosInstance.put(`/orders/${id}`, data);
    return response.data;
  } catch (_error) {
    console.error('Error updating order:', _error);
    throw _error;
  }
};


// todo: api manager navigator
export const getFeatures = async (params?: PaginationParams): Promise<PaginatedResponse<Feature>> => {
  try {
    const response = await axiosInstance.get(`/feature`, {params});
    return response.data;
  } catch (_error) {
    console.error('Error fetching navigator:', _error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};
// get all features without pagination just support search query
export const getAllFeatures = async (search?: string): Promise<Feature[]> => {
  try {
    const response = await axiosInstance.get(`/feature/all`, {params: {search}});
    return response.data;
  } catch (_error) {
    console.error('Error fetching navigator:', _error);
    return [];
  }
};

export const createFeature = async (data: any): Promise<Feature> => {
  try {
    const response = await axiosInstance.post(`/feature`, data);
    return response.data;
  } catch (_error) {
    console.error('Error creating navigator:', _error);
    throw _error;
  }
};

export const updateFeature = async (id: string, data: any): Promise<Feature> => {
  try {
    const response = await axiosInstance.put(`/feature/${id}`, data);
    return response.data;
  } catch (_error) {
    console.error('Error updating navigator:', _error);
    throw _error;
  }
};

export const deleteFeature = async (id?: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/feature/${id}`);
  } catch (_error) {
    console.error('Error deleting navigator:', _error);
    throw _error;
  }
};

export const assignPermissions = async (id: number, data: any): Promise<void> => {
  try {
    await axiosInstance.post(`/feature/${id}/permissions`, data);
  } catch (_error) {
    console.error('Error assigning permissions:', _error);
    throw _error;
  }
};

export const removePermissions = async (id: number, data: any): Promise<void> => {
  try {
    await axiosInstance.delete(`/feature/${id}/permissions`, data);
  } catch (_error) {
    console.error('Error removing permissions:', _error);
    throw _error;
  }
};

export const getFeaturePermissions = async (id: number): Promise<Permission[]> => {
  try {
    const response = await axiosInstance.get(`/feature/${id}/permissions`);
    return response.data;
  } catch (_error) {
    console.error('Error fetching navigator permissions:', _error);
    throw _error;
  }
};
// todo: api category 
export const getCategories  = async (params?: PaginationParams): Promise<PaginatedResponse<Category>> =>{
  try {
    const response = await axiosInstance.get(`/categories`);
    return response.data;
  } catch (_error) {
    console.error('Error fetching categories:', _error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 }
  }
};

export const createCategory = async (data: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/categories`, data);
    return response.data;
  } catch (_error) {
    console.error('Error creating category:', _error);
    throw _error;
  }
};  

export const updateCategory = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/categories/${id}`, data);
    return response.data;
  } catch (_error) {
    console.error('Error updating category:', _error);
    throw _error;
  }
};

export const updateCategoryStatus = async (id: string, data: any): Promise<any> => {

  try {
    const response = await axiosInstance.put(`/categories/update-status/${id}`, data);
    return response.data;
  } catch (_error) {
    console.error('Error updating category status:', _error);
    throw _error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/categories/${id}`);
  } catch (_error) {
    console.error('Error deleting category:', _error);
    throw _error;
  }
};

// todo: api category type
export const getCategoryTypes = async (params?: PaginationParams): Promise<PaginatedResponse<CategoryType>> => {
  try {
  const response = await axiosInstance.get('/category-types', { params });
  if (!response.data) {
    throw new Error('Failed to fetch category types');
  }
  return response.data;
  }
  catch (_error) {
    console.error('Error fetching category types:', _error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getAllCategoryTypes = async (): Promise<CategoryType[]> => {
  try {
    const response = await axiosInstance.get('/category-types/all');
    return response.data;
  } catch (_error) {
    console.error('Error fetching category types:', _error);
    return [];
  }
};

export const syncCategoryType = async (): Promise<void> => {
  try {
    await axiosInstance.post('/category-type-sync/sync-all');
  } catch (_error) {
    console.error('Error syncing category types:', _error);
    throw _error;
  }
};
export const createCategoryType = async (data: CategoryType): Promise<CategoryType> => {
  const response = await axiosInstance.post('/category-types', data,
  );
  if (!response.data) {
    throw new Error('Failed to create category type');
  }
  return response.data;
};

export const updateCategoryType = async (id: string, data: Partial<CategoryType>): Promise<CategoryType> => {
  const response = await axiosInstance.put(`/category-types/${id}`, 
    data,
  );
  if (!response.data) {
    throw new Error('Failed to update category type');
  }
  return response.data;
};

export const deleteCategoryType = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/category-types/${id}`);
};

export const getCategoryByParent = async (id: string): Promise<Category[]> => {
  try {
    const response = await axiosInstance.get(`/category-types/parent/${id}`);
    return response.data.categories;
  } catch (_error) {
    console.error('Error fetching category type:', _error);
    throw _error;
  }
};

export const getCategoryByCode = async (code: string): Promise<Category[]> => {
  try {
    const response = await axiosInstance.get(`/category-types/code/${code}`);
    return response.data.categories;
  } catch (_error) {
    console.error('Error fetching category type:', _error);
    throw _error;
  }
};

export const getArticleParentTypes = async (): Promise<CategoryType[]> => {
  try {
    const response = await axiosInstance.get(`/category-types/article`);
    return response.data;
  } catch (_error) {
    console.error('Error fetching article parent types:', _error);
    throw _error;
  }
};

export const getTable = async (id:string): Promise<Table> => {
  try {
    const response = await axiosInstance.get(`/table/${id}`);
    return response.data;
  } catch (_error) {
    console.error('Error fetching tables:', _error);
    throw _error;
  }
};

export const getTables = async (params?: PaginationParams): Promise<PaginatedResponse<Table>> => {
  try {
    const response = await axiosInstance.get(`/table`, {params} );
    return response.data;
  } catch (_error) {
    console.error('Error fetching tables:', _error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const createTable = async (tableData: any): Promise<Table> => {
  try {
    const response = await axiosInstance.post(`/table`, tableData);
    return response.data;
  } catch (_error) {
    console.error('Error creating table:', _error);
    throw _error;
  }
};

export const updateTable = async (id: string, tableData: any): Promise<Table> => {
  try {
    const response = await axiosInstance.put(`/table/${id}`, tableData);
    return response.data;
  } catch (_error) {
    console.error('Error updating table:', _error);
    throw _error;
  }
};

export const deleteTable = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/table/${id}`);
  } catch (_error) {
    console.error('Error deleting table:', _error);
    throw _error;
  }
};

// Data Source API functions
export const getDataSources = async (params?: PaginationParams): Promise<PaginatedResponse<DataSource>> => {
  try {
    const response = await axiosInstance.get(`/data-source`, { params });
    return response.data;
  } catch (_error) {
    console.error('Error fetching data sources:', _error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getAllDataSources = async (): Promise<DataSource[]> => {
  try {
    const response = await axiosInstance.get(`/data-source/all`);
    return response.data;
  } catch (_error) {
    console.error('Error fetching data sources:', _error);
    throw _error;
  }
};

export const getDataSource = async (id: string): Promise<DataSource> => {
  try {
    const response = await axiosInstance.get(`/data-source/${id}`);
    return response.data;
  } catch (_error) {
    console.error('Error fetching data source:', _error);
    throw _error;
  }
};

export const createDataSource = async (data: any): Promise<DataSource> => {
  try {
    const response = await axiosInstance.post(`/data-source`, data);
    return response.data;
  } catch (_error) {
    console.error('Error creating data source:', _error);
    throw _error;
  }
};

export const updateDataSource = async (id: string, data: any): Promise<DataSource> => {
  try {
    const response = await axiosInstance.put(`/data-source/${id}`, data);
    return response.data;
  } catch (_error) {
    console.error('Error updating data source:', _error);
    throw _error;
  }
};

export const updateDataSourceStatus = async (id: string, data: any): Promise<DataSource> => {
  try {
    const response = await axiosInstance.put(`/data-source/${id}/status`, data);
    return response.data;
  } catch (_error) {
    console.error('Error updating data source status:', _error);
    throw _error;
  }
};

export const deleteDataSource = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/data-source/${id}`);
  } catch (_error) {
    console.error('Error deleting data source:', _error);
    throw _error;
  }
};

export const getDataSourceTypes = async (): Promise<DataSourceTypeOption[]> => {
  try {
    const response = await axiosInstance.get(`/data-source/types`);
    return response.data;
  } catch (_error) {
    console.error('Error fetching data source types:', _error);
    throw _error;
  }
}; 
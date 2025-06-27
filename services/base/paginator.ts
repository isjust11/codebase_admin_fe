interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }
  
  interface PaginationParams {
    page?: number;
    size?: number;
    search?: string;
  }
  
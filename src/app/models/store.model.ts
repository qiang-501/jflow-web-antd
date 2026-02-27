// store.model.ts - 通用 Store 类型定义
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface LoadingState {
  loading: boolean;
  error: ApiError | null;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

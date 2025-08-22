
export const AppConstants = {
  AccessToken: 'accessToken',
  User: 'user',
  RefreshToken: 'refreshToken',
  Remember: 'remember',
  Username: 'username',
  Password: 'password',
  Feature: 'feature',
  Permissions: 'permissions',
}
export const AppRoutes = {
  Auth: {
    Login: '/auth/login',
    Register: '/auth/register',
    ForgotPassword: '/auth/forgot-password',
    ResetPassword: '/auth/reset-password',
    VerifyEmail: '/auth/verify-email',
    RefreshToken: '/auth/refresh-token',
    ResendEmail: '/auth/resend-email',
    ValidateToken: '/auth/validate-token',
  },
  Home: '/',
  Manager: {
    Tables: '/manager/tables',
    TablesCreate: '/manager/tables/create',
    TablesUpdate: '/manager/tables/update',
    TablesDetail: '/manager/tables',
    TablesQrCodes: '/manager/tables/qrcodes',
    Articles: '/manager/articles',
    ArticlesCreate: '/manager/articles/create',
    ArticlesUpdate: '/manager/articles/update',
    ArticlesDetail: '/manager/articles',
    Category:'/manager/category'
  }
}
export const AppCategoryCode = {
  FeatureType: {
    id: 'FeatureType',
    name: 'Menu chức năng',
  },
  FoodCategory: {
    id: 'FoodCategory',
    name: 'Danh mục món ăn',
  },
  FoodType: {
    id: 'FoodType',
    name: 'Loại món ăn',
  },
  FoodStatus: {
    id: 'FoodStatus',
    name: 'Trạng thái món ăn',
  },
  FoodUnit: {
    id: 'FoodUnit',
    name: 'Đơn vị món ăn',
  },
  TableType: {
    id: 'TableType',
    name: 'Loại bàn',
  },
  TableStatus: {
    id: 'TableStatus',
    name: 'Trạng thái bàn',
  },
  TableArea: {
    id: 'TableArea',
    name: 'Khu vực bàn',
  },
  FolkMedicine: {
    id: 'FolkMedicine',
    name: 'FolkMedicine',
  },
  ArticleStatus: {
    id: 'ArticleStatus',
    name: 'Trạng thái bài viết',
  },
  ArticleType: {
    id: 'ArticleType',
    name: 'Loại bài viết',
  },
}
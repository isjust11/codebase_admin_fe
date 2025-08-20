
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
  }
}
export const AppCategoryCode = {
  FeatureType: 'Menu chức năng',
  FoodCategory: 'Danh mục món ăn',
  FoodType: 'Loại món ăn',
  FoodStatus:'Trạng thái món ăn',
  FoodUnit: 'Đơn vị món ăn',
  TableType: 'Loại bàn',
  TableStatus: 'Trạng thái bàn',
  TableArea: 'Khu vực bàn',
  FolkMedicine: 'FolkMedicine',
  FEATURE_MENU: 'FEATURE_MENU',
  ArticleStatus: 'Trạng thái bài viết',
}
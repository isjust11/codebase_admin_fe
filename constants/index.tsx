
export const AppConstants = {
  AccessToken: 'accessToken',
  User: 'user',
  RefreshToken: 'refreshToken',
  Remember: 'remember',
  Username: 'username',
  Password: 'password',
  Feature: 'feature',
  Permissions: 'permissions',
  IsLoadSidebar: 'isLoadSidebar',
}
export const AppRoutes = {
  Auth: {
    Login: '/login',
    Register: '/register',
    ForgotPassword: '/auth/forgot-password',
    ResetPassword: '/auth/reset-password',
    VerifyEmail: '/auth/verify-email',
    // RefreshToken: '/auth/refresh-token',
    ResendEmail: '/auth/resend-email',
    ValidateToken: '/auth/validate-token',
    Success: '/success',
    Error: '/error',
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
    StaticPages: '/manager/static-pages',
    StaticPagesCreate: '/manager/static-pages/create',
    StaticPagesUpdate: '/manager/static-pages/update',
    StaticPagesDetail: '/manager/static-pages/details',
    Category: '/manager/category',
    Ebooks: '/manager/ebooks',
    EbooksCreate: '/manager/ebooks/create',
    EbooksUpdate: '/manager/ebooks/update',
    EbooksDetail: '/manager/ebooks',
    SubscriptionPlans: '/manager/subscription-plans',
    SubscriptionPlansCreate: '/manager/subscription-plans/create',
    SubscriptionPlansUpdate: '/manager/subscription-plans/update',
    SubscriptionPlansDetail: '/manager/subscription-plans',
  }
}
export const AppApi = {
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
}
export const AppCategoryCode = {

  FEATURE_TYPE: {
    code: 'FEATURE_TYPE',
    name: 'Menu chức năng',
  },
  FoodCategory: {
    code: 'FoodCategory',
    name: 'Danh mục món ăn',
  },
  FoodType: {
    code: 'FoodType',
    name: 'Loại món ăn',
  },
  FoodStatus: {
    code: 'FoodStatus',
    name: 'Trạng thái món ăn',
  },
  FoodUnit: {
    code: 'FoodUnit',
    name: 'Đơn vị món ăn',
  },
  UnitOfMeasure: {
    code: 'UnitOfMeasure',
    name: 'Đơn vị tính'
  },
  TableStatus: {
    code: 'TableStatus',
    name: 'Trạng thái bàn',
  },
  TableArea: {
    code: 'TableArea',
    name: 'Khu vực bàn',
  },
  FolkMedicine: {
    code: 'FolkMedicine',
    name: 'Dược liệu dân gian',
  },
  FEATURE_MENU: {
    code: 'FEATURE_MENU',
    name: 'Menu chức năng',
  },
  ArticleStatus: {
    code: 'ArticleStatus',
    name: 'Trạng thái bài viết',
  },
  ArticleType: {
    code: 'ArticleType',
    name: 'Loại bài viết',
  },
  Herbal: {
    code: 'Herbal',
    name: 'Dược liệu dân gian',
  },
  Disease: {
    code: 'Disease',
    name: 'Bệnh',
  },
  PartsUsed: {
    code: 'PartsUsed',
    name: 'Phần sử dụng',
  },
  BookCategory: {
    code: 'BOOK_CATEGORY',
    name: 'Danh mục sách',
  },
}
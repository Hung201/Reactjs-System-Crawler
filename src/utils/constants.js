// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  CRAWLER: 'crawler',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.EDITOR]: 'Biên tập viên',
  [USER_ROLES.VIEWER]: 'Người xem',
  [USER_ROLES.CRAWLER]: 'Crawler',
};

// Data Types
export const DATA_TYPES = {
  PRODUCT: 'product',
  NEWS: 'news',
  BLOG: 'blog',
  CUSTOM: 'custom',
};

export const DATA_TYPE_LABELS = {
  [DATA_TYPES.PRODUCT]: 'Sản phẩm',
  [DATA_TYPES.NEWS]: 'Tin tức',
  [DATA_TYPES.BLOG]: 'Blog',
  [DATA_TYPES.CUSTOM]: 'Tùy chỉnh',
};

// Source Status
export const SOURCE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
};

export const SOURCE_STATUS_LABELS = {
  [SOURCE_STATUS.ACTIVE]: 'Hoạt động',
  [SOURCE_STATUS.INACTIVE]: 'Tạm dừng',
  [SOURCE_STATUS.ARCHIVED]: 'Đã lưu trữ',
};

// Data Status
export const DATA_STATUS = {
  PENDING: 'pending',
  TRANSLATED: 'translated',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const DATA_STATUS_LABELS = {
  [DATA_STATUS.PENDING]: 'Chờ xử lý',
  [DATA_STATUS.TRANSLATED]: 'Đã dịch',
  [DATA_STATUS.APPROVED]: 'Đã duyệt',
  [DATA_STATUS.REJECTED]: 'Từ chối',
};

// Actor Status
export const ACTOR_STATUS = {
  READY: 'ready',
  ERROR: 'error',
  RUNNING: 'running',
};

export const ACTOR_STATUS_LABELS = {
  [ACTOR_STATUS.READY]: 'Sẵn sàng',
  [ACTOR_STATUS.ERROR]: 'Lỗi',
  [ACTOR_STATUS.RUNNING]: 'Đang chạy',
};

// Run Status
export const RUN_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
};

export const RUN_STATUS_LABELS = {
  [RUN_STATUS.RUNNING]: 'Đang chạy',
  [RUN_STATUS.SUCCESS]: 'Thành công',
  [RUN_STATUS.FAILED]: 'Thất bại',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date Formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
    REGISTER: '/auth/register',
  },
  SOURCES: '/sources',
  DATA: '/data',
  USERS: '/users',
  ACTORS: '/actors',
  LOGS: '/logs',
  DASHBOARD: '/dashboard',
};

// Campaign Status
export const CAMPAIGN_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  DRAFT: 'draft',
};

export const CAMPAIGN_STATUS_LABELS = {
  [CAMPAIGN_STATUS.ACTIVE]: 'Đang chạy',
  [CAMPAIGN_STATUS.PAUSED]: 'Tạm dừng',
  [CAMPAIGN_STATUS.COMPLETED]: 'Hoàn thành',
  [CAMPAIGN_STATUS.DRAFT]: 'Bản nháp',
};

// Navigation
export const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'Home',
    roles: [USER_ROLES.ADMIN, USER_ROLES.EDITOR, USER_ROLES.VIEWER],
  },
  {
    path: '/sources',
    label: 'Nguồn Crawl',
    icon: 'Globe',
    roles: [USER_ROLES.ADMIN, USER_ROLES.CRAWLER],
  },
  {
    path: '/data',
    label: 'Dữ liệu',
    icon: 'Database',
    roles: [USER_ROLES.ADMIN, USER_ROLES.EDITOR, USER_ROLES.VIEWER],
  },
  {
    path: '/users',
    label: 'Người dùng',
    icon: 'Users',
    roles: [USER_ROLES.ADMIN],
  },
  {
    path: '/actors',
    label: 'Actor',
    icon: 'Code',
    roles: [USER_ROLES.ADMIN, USER_ROLES.CRAWLER],
  },
  {
    path: '/campaigns',
    label: 'Chiến dịch',
    icon: 'Target',
    roles: [USER_ROLES.ADMIN, USER_ROLES.CRAWLER, USER_ROLES.EDITOR],
  },
  {
    path: '/integrations',
    label: 'Integrations',
    icon: 'Settings',
    roles: [USER_ROLES.ADMIN, USER_ROLES.CRAWLER, USER_ROLES.EDITOR],
  },
  {
    path: '/logs',
    label: 'Nhật ký',
    icon: 'FileText',
    roles: [USER_ROLES.ADMIN, USER_ROLES.EDITOR],
  },
]; 
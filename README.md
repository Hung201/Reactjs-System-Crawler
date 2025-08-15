# System Crawler Frontend

Frontend cho hệ thống crawl dữ liệu giống Apify - Quản lý và thu thập dữ liệu từ nhiều nguồn.

## 🚀 Tính năng chính

- **Dashboard**: Thống kê tổng quan với biểu đồ và metrics
- **Quản lý nguồn crawl**: Thêm, sửa, xóa các nguồn dữ liệu
- **Quản lý dữ liệu**: Xem, duyệt, dịch nội dung crawl
- **Quản lý người dùng**: Phân quyền RBAC (Admin, Editor, Viewer, Crawler)
- **Quản lý Actor**: Upload và chạy các actor Apify
- **Nhật ký**: Theo dõi lịch sử chạy actor

## 🛠️ Công nghệ sử dụng

- **React 18** - UI Framework
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **Zustand** - State Management
- **React Query (TanStack Query)** - Data Fetching
- **React Hook Form** - Form Management
- **Lucide React** - Icons
- **Recharts** - Charts
- **React Hot Toast** - Notifications

## 📦 Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd system-crawler-frontend
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy ứng dụng**
```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 🔧 Cấu hình

### Environment Variables

1. **Tạo file `.env` từ template**
```bash
cp .env.example .env
```

2. **Cấu hình các biến môi trường trong file `.env`:**
```env
# Apify API Configuration
REACT_APP_APIFY_API_TOKEN=your_apify_api_token_here
REACT_APP_APIFY_BASE_URL=https://api.apify.com/v2

# Backend API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api

# Other environment variables
REACT_APP_ENVIRONMENT=development
```

**⚠️ Lưu ý quan trọng:**
- File `.env` chứa thông tin nhạy cảm và đã được thêm vào `.gitignore`
- Không bao giờ commit file `.env` lên Git
- Chỉ sử dụng file `.env.example` làm template

### Backend API

Đảm bảo backend API đang chạy và có các endpoints sau:

- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user
- `GET /api/sources` - Lấy danh sách nguồn crawl
- `POST /api/sources` - Tạo nguồn crawl
- `GET /api/data` - Lấy dữ liệu crawl
- `GET /api/users` - Quản lý người dùng
- `GET /api/actors` - Quản lý actor
- `GET /api/logs` - Nhật ký chạy
- `GET /api/dashboard/stats` - Thống kê dashboard

## 👥 Tài khoản demo

- **Admin**: `admin@example.com` / `password123`
- **Editor**: `editor@example.com` / `password123`
- **Viewer**: `viewer@example.com` / `password123`

## 📁 Cấu trúc dự án

```
src/
├── components/          # Components tái sử dụng
│   ├── Auth/           # Components authentication
│   ├── Common/         # Components chung
│   └── Layout/         # Layout components
├── pages/              # Các trang chính
│   ├── Auth/           # Trang đăng nhập
│   ├── Dashboard/      # Dashboard
│   ├── CrawlSources/   # Quản lý nguồn crawl
│   ├── CrawlData/      # Quản lý dữ liệu
│   ├── Users/          # Quản lý người dùng
│   ├── ActorUploads/   # Quản lý actor
│   └── RunLogs/        # Nhật ký chạy
├── services/           # API services
├── stores/             # Zustand stores
├── utils/              # Utilities và constants
└── App.js              # Component chính
```

## 🎨 UI Components

### Buttons
- `.btn-primary` - Nút chính
- `.btn-secondary` - Nút phụ
- `.btn-danger` - Nút nguy hiểm

### Cards
- `.card` - Card container

### Forms
- `.input-field` - Input field

### Tables
- `.table-header` - Header của table
- `.table-cell` - Cell của table

## 🔐 Phân quyền

### Roles
- **Admin**: Toàn quyền quản lý hệ thống
- **Editor**: Duyệt và chỉnh sửa dữ liệu
- **Viewer**: Chỉ đọc dữ liệu
- **Crawler**: Tạo nguồn crawl, upload actor

### Route Protection
Các route được bảo vệ theo role trong `src/utils/constants.js`

## 📊 Dashboard

Dashboard hiển thị:
- Thống kê tổng quan (dữ liệu, nguồn, người dùng)
- Biểu đồ dữ liệu theo thời gian
- Dữ liệu gần đây
- Thao tác nhanh

## 🔄 State Management

### Zustand Stores
- `authStore` - Quản lý authentication
- Có thể thêm các stores khác khi cần

### React Query
- Quản lý server state
- Caching và invalidation
- Optimistic updates

## 🎯 Tính năng nâng cao

### Real-time Updates
- Có thể tích hợp WebSocket để cập nhật real-time
- Polling cho dashboard stats

### Export Data
- Export dữ liệu ra CSV/Excel
- Download logs

### Advanced Filtering
- Filter theo nhiều tiêu chí
- Search full-text
- Date range picker

## 🚀 Deployment

### Build Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload thư mục build lên Netlify
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📝 License

MIT License

## 🆘 Support

Nếu có vấn đề, vui lòng tạo issue trên GitHub repository. 
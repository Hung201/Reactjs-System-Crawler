# Hướng dẫn Test Frontend không cần Backend

## 🚀 Cách chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm start
```

## 🔐 Đăng nhập với Mock Data

Sau khi chạy `npm start`, bạn có thể đăng nhập với các tài khoản demo:

### Tài khoản Admin (Quyền cao nhất)
- **Email:** `admin@example.com`
- **Password:** `password123`
- **Quyền:** Xem tất cả trang, quản lý users, actors, sources

### Tài khoản Editor (Quyền trung bình)
- **Email:** `editor@example.com`
- **Password:** `password123`
- **Quyền:** Xem và chỉnh sửa data, sources, actors

### Tài khoản Viewer (Quyền thấp nhất)
- **Email:** `viewer@example.com`
- **Password:** `password123`
- **Quyền:** Chỉ xem data, không thể chỉnh sửa

## 📊 Các trang có thể test

### 1. Dashboard
- Hiển thị thống kê tổng quan
- Biểu đồ dữ liệu theo thời gian
- Bảng dữ liệu gần đây
- Các action nhanh

### 2. Crawl Sources
- Danh sách nguồn crawl
- Thêm/sửa/xóa sources
- Chạy actors
- Filter theo status và type

### 3. Crawl Data
- Xem dữ liệu đã crawl
- Filter theo status và type
- Xem chi tiết từng item
- Các action: approve, reject, translate

### 4. Users
- Quản lý người dùng
- Thay đổi role
- Xóa users

### 5. Actor Uploads
- Quản lý actors
- Chạy actors
- Xem thông tin chi tiết

### 6. Run Logs
- Lịch sử chạy actors
- Thống kê thành công/thất bại
- Filter theo status và actor

## 🎨 Tính năng UI/UX

### Responsive Design
- Hoạt động tốt trên desktop, tablet, mobile
- Sidebar có thể thu gọn
- Header responsive

### Interactive Elements
- Loading states
- Toast notifications
- Modal dialogs
- Form validation
- Search và filter

### Visual Feedback
- Hover effects
- Loading spinners
- Color-coded status
- Icons và badges

## 🔧 Mock Data

Tất cả dữ liệu hiển thị là mock data được tạo sẵn trong:
- `src/mocks/data.js` - Dữ liệu cho các trang
- `src/services/mockAuth.js` - Mock authentication

## ⚠️ Lưu ý

1. **Không có backend thực** - Tất cả API calls sẽ fail nếu không có backend
2. **Dữ liệu không lưu trữ** - Thay đổi sẽ mất khi refresh trang
3. **Chỉ để test UI** - Không thể test logic nghiệp vụ thực tế

## 🚀 Bước tiếp theo

Khi có backend thực:
1. Xóa mock data imports
2. Uncomment API calls thực
3. Cấu hình environment variables
4. Test với dữ liệu thực

## 📝 Troubleshooting

### Lỗi "Module not found"
```bash
npm install
```

### Lỗi port đã được sử dụng
```bash
# Thay đổi port
PORT=3002 npm start
```

### Lỗi CORS
- Chỉ xảy ra khi có backend
- Cấu hình CORS trên backend

### Lỗi authentication
- Kiểm tra mock credentials
- Clear localStorage nếu cần 
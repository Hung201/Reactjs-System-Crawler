# Environment Variables Setup

## Cách cấu hình API Token trong .env

### 1. Tạo file .env

Tạo file `.env` trong thư mục gốc của project (cùng cấp với `package.json`):

```bash
# Apify API Configuration
REACT_APP_APIFY_API_TOKEN=your_apify_api_token_here

# Other environment variables
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

### 2. Lấy API Token từ Apify

1. Đăng nhập vào [Apify Console](https://console.apify.com/)
2. Vào **Settings** > **Integrations**
3. Copy API token của bạn
4. Paste vào file `.env` thay thế `your_apify_api_token_here`

### 3. Restart Development Server

Sau khi tạo file `.env`, bạn cần restart development server:

```bash
npm start
```

### 4. Cách hoạt động

- Nếu platform có API token: Sử dụng token từ platform
- Nếu platform không có token: Sử dụng token từ `.env`
- Nếu cả hai đều không có: Hiển thị thông báo lỗi

### 5. Bảo mật

⚠️ **Lưu ý quan trọng:**
- File `.env` đã được thêm vào `.gitignore` để không commit lên git
- Không bao giờ commit API token lên repository
- Chỉ sử dụng `.env` cho development
- Cho production, sử dụng environment variables của hosting platform

### 6. Cấu trúc file .env

```env
# Apify API Configuration
REACT_APP_APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Backend API URL (nếu có)
REACT_APP_API_BASE_URL=http://localhost:3001/api

# Các biến môi trường khác
REACT_APP_ENV=development
```

### 7. Troubleshooting

Nếu gặp lỗi "No API token available":

1. Kiểm tra file `.env` có tồn tại không
2. Kiểm tra tên biến có đúng `REACT_APP_APIFY_API_TOKEN` không
3. Restart development server
4. Kiểm tra console để xem warning messages

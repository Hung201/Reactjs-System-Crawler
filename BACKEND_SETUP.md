# Hướng dẫn khởi động Backend Server

## Vấn đề thường gặp

Khi gặp lỗi `ERR_CONNECTION_REFUSED` hoặc `Network Error` trong frontend, có thể do backend server chưa được khởi động.

## Cách khắc phục

### 1. Kiểm tra Backend Server

```bash
# Di chuyển đến thư mục backend
cd ../backend

# Kiểm tra xem có file package.json không
ls package.json

# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi động server
npm start
```

### 2. Kiểm tra Port 5000

```bash
# Kiểm tra port 5000 có đang được sử dụng không
netstat -ano | findstr :5000

# Hoặc trên Linux/Mac
lsof -i :5000
```

### 3. Kiểm tra file .env

Đảm bảo file `.env` trong thư mục frontend có cấu hình đúng:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Khởi động cả Frontend và Backend

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

## Các lỗi thường gặp

### Lỗi "Port 5000 already in use"
```bash
# Tìm process đang sử dụng port 5000
netstat -ano | findstr :5000

# Kill process đó
taskkill /PID <PID> /F
```

### Lỗi "Module not found"
```bash
# Cài đặt lại dependencies
npm install
```

### Lỗi "Database connection failed"
```bash
# Kiểm tra MongoDB có đang chạy không
# Khởi động MongoDB service
```

## Troubleshooting

1. **Kiểm tra console backend** để xem lỗi chi tiết
2. **Kiểm tra network tab** trong browser DevTools
3. **Kiểm tra file logs** của backend
4. **Restart cả frontend và backend**

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề, vui lòng:
1. Chụp màn hình lỗi
2. Copy log từ console
3. Mô tả các bước đã thực hiện 
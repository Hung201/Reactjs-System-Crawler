# Test API Connection

## 1. Kiểm tra Backend có chạy không

```bash
# Test health endpoint
curl -X GET http://localhost:5000/api/health

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Test get users endpoint
curl -X GET http://localhost:5000/api/users
```

## 2. Test từ Frontend

Truy cập: `http://localhost:3000/test-api`

## 3. Các vấn đề có thể gặp

### CORS Error
Nếu gặp CORS error, cần thêm vào backend:

```javascript
// app.js hoặc server.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Network Error
- Kiểm tra backend có chạy trên port 5000 không
- Kiểm tra firewall
- Kiểm tra URL trong api.js có đúng không

### Authentication Error
- Kiểm tra JWT_SECRET trong backend
- Kiểm tra password hash có đúng không

## 4. Debug Steps

1. Mở Developer Tools (F12)
2. Vào tab Network
3. Thực hiện login
4. Xem request/response để debug

## 5. Test Credentials

```
Admin: admin@example.com / password123
Editor: editor@example.com / password123  
Viewer: viewer@example.com / password123
``` 
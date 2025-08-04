# Test API Đăng Ký

## 🎯 **API Endpoint**
```
POST http://localhost:5000/api/auth/register
```

## 🎯 **Test Cases**

### ✅ **1. Đăng ký thành công (Viewer)**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "user1@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công! Vui lòng đăng nhập.",
  "data": {
    "user": {
      "id": "...",
      "name": "Nguyễn Văn A",
      "email": "user1@example.com",
      "role": "viewer"
    }
  }
}
```

### ✅ **2. Đăng ký với role Admin**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin2@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

### ✅ **3. Đăng ký với role Editor**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Editor User",
    "email": "editor2@example.com",
    "password": "password123",
    "role": "editor"
  }'
```

## 🚫 **Test Cases Lỗi**

### ❌ **1. Email đã tồn tại**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "error": "Email đã được sử dụng"
}
```

### ❌ **2. Email không hợp lệ**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "password": "password123"
  }'
```

### ❌ **3. Mật khẩu quá ngắn**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "123"
  }'
```

### ❌ **4. Tên quá ngắn**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### ❌ **5. Role không hợp lệ**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "invalid-role"
  }'
```

## 🎯 **Test với PowerShell**

### **Đăng ký thành công:**
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

### **Đăng ký với role Admin:**
```powershell
$body = @{
    name = "Admin User"
    email = "admin@example.com"
    password = "password123"
    role = "admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

## 🎯 **Test với Postman**

### **Request:**
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/register`
- **Headers:** `Content-Type: application/json`

### **Body (raw JSON):**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "viewer"
}
```

## 🎯 **Test Frontend**

### **1. Mở trang đăng ký:**
```
http://localhost:3000/register
```

### **2. Điền thông tin:**
- **Họ và tên:** Test User
- **Email:** test@example.com
- **Mật khẩu:** password123
- **Xác nhận mật khẩu:** password123

### **3. Click "Đăng ký"**

### **4. Kiểm tra kết quả:**
- ✅ Toast message: "Đăng ký thành công! Vui lòng đăng nhập."
- ✅ Chuyển hướng đến trang login
- ✅ Có thể đăng nhập với tài khoản vừa tạo

## 🎯 **Validation Rules**

| Field | Rule | Message |
|-------|------|---------|
| name | Required, 2-50 chars | "Tên phải có từ 2-50 ký tự" |
| email | Required, valid email, unique | "Email không hợp lệ" / "Email đã được sử dụng" |
| password | Required, min 6 chars | "Mật khẩu phải có ít nhất 6 ký tự" |
| role | Optional, enum: admin/editor/viewer | "Role không hợp lệ" |

## 🎯 **Default Values**

- **role:** "viewer" (nếu không được cung cấp)
- **status:** "active"
- **createdAt:** Current timestamp
- **updatedAt:** Current timestamp

## 🎯 **Security Features**

✅ **Password Hashing** - Mật khẩu được mã hóa với bcrypt  
✅ **Email Validation** - Kiểm tra format và unique  
✅ **Input Sanitization** - Loại bỏ whitespace và validate  
✅ **Role-based Access** - 3 roles: admin, editor, viewer  
✅ **Error Handling** - Xử lý lỗi an toàn  
✅ **Logging** - Ghi log các hoạt động đăng ký 
# Debug Login Issue

## 🎯 **Vấn đề:**
Đăng nhập thành công nhưng không chuyển trang

## 🎯 **Nguyên nhân có thể:**

### 1. **API Response Structure**
- ✅ API trả về đúng format: `{success: true, data: {user, token}}`
- ✅ Code đã sửa: `response.data.data`

### 2. **State Management**
- ❓ Zustand state không được update
- ❓ Persistence middleware có vấn đề

### 3. **Navigation**
- ❓ React Router có vấn đề
- ❓ ProtectedRoute blocking

## 🎯 **Test Steps:**

### **1. Kiểm tra Console Logs**
Mở Developer Tools (F12) và thử đăng nhập, xem:
```
Đang đăng nhập với: test@example.com
Login response: {success: true, data: {...}}
Setting auth state: {user: {...}, token: "..."}
Kết quả đăng nhập: {success: true}
isAuthenticated changed to true, redirecting...
```

### **2. Kiểm tra Local Storage**
Sau khi đăng nhập, kiểm tra:
```javascript
// Trong Console
localStorage.getItem('auth-storage')
```

### **3. Test API trực tiếp**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","password":"password123"}'
```

### **4. Test với tài khoản khác**
Thử đăng nhập với:
- `admin@system-crawler.com` / `admin123`
- `test@example.com` / `password123`

## 🎯 **Giải pháp:**

### **1. Force Redirect (Đã implement)**
```javascript
useEffect(() => {
  if (isAuthenticated) {
    window.location.href = '/dashboard';
  }
}, [isAuthenticated]);
```

### **2. Clear Local Storage**
```javascript
// Trong Console
localStorage.removeItem('auth-storage')
```

### **3. Restart Frontend**
```bash
npm start
```

### **4. Check Backend**
```bash
# Kiểm tra backend có chạy không
netstat -an | findstr :5000
```

## 🎯 **Expected Behavior:**

1. **Đăng nhập thành công** → Toast "Đăng nhập thành công!"
2. **State update** → `isAuthenticated: true`
3. **useEffect trigger** → Redirect to `/dashboard`
4. **ProtectedRoute** → Render Dashboard component

## 🎯 **Debug Commands:**

### **Check if backend is running:**
```powershell
netstat -an | findstr :5000
```

### **Test API directly:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","password":"password123"}'
```

### **Check localStorage:**
```javascript
// In browser console
console.log(localStorage.getItem('auth-storage'))
```

### **Force clear auth:**
```javascript
// In browser console
localStorage.removeItem('auth-storage')
location.reload()
```

## 🎯 **Next Steps:**

1. **Thử đăng nhập** và xem console logs
2. **Kiểm tra localStorage** có lưu token không
3. **Test với tài khoản khác** xem có vấn đề gì khác không
4. **Restart frontend** nếu cần 
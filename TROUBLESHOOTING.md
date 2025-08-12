# 🔧 Hướng dẫn khắc phục lỗi - System Crawler

## 🚨 Lỗi thường gặp và cách khắc phục

### 1. **Lỗi Manifest Icon (logo192.png)**

**Lỗi:**
```
Error while trying to use the following icon from the Manifest: 
http://localhost:3000/logo192.png (Download error or resource isn't a valid image)
```

**Nguyên nhân:** File icon không tồn tại trong thư mục `public/`

**Cách khắc phục:**
- ✅ **Đã sửa:** Xóa các icon không tồn tại khỏi `manifest.json`
- Hoặc tạo file icon: `public/logo192.png` và `public/logo512.png`

### 2. **Lỗi API Campaign Run (400 Bad Request)**

**Lỗi:**
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
http://localhost:5000/api/campaigns/{id}/run
```

**Nguyên nhân:**
- Campaign ID không hợp lệ
- Dữ liệu input không đúng format
- Backend API chưa được implement
- Lỗi validation

**Cách khắc phục:**

#### A. Kiểm tra Backend API
```bash
# Kiểm tra backend có chạy không
curl http://localhost:5000/health

# Kiểm tra endpoint campaign
curl http://localhost:5000/api/campaigns
```

#### B. Kiểm tra Campaign ID
```javascript
// Trong CampaignDetail.js
console.log('Campaign ID:', id);
console.log('Campaign data:', campaign);
```

#### C. Kiểm tra Input Schema
```javascript
// Đảm bảo input schema hợp lệ
const inputSchema = campaign?.inputSchema;
console.log('Input Schema:', inputSchema);
```

### 3. **Lỗi AxiosError trong Campaign Service**

**Lỗi:**
```
Error running campaign: AxiosError
```

**Nguyên nhân:**
- Lỗi network
- Server không phản hồi
- CORS issues
- Authentication failed

**Cách khắc phục:**

#### A. Kiểm tra Network
```javascript
// Trong browser console
fetch('http://localhost:5000/api/campaigns')
  .then(response => console.log('Status:', response.status))
  .catch(error => console.error('Error:', error));
```

#### B. Kiểm tra CORS
```javascript
// Backend CORS config
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
```

#### C. Kiểm tra Authentication
```javascript
// Kiểm tra token
const token = useAuthStore.getState().token;
console.log('Token:', token ? 'Valid' : 'Missing');
```

### 4. **Lỗi kết nối server**

**Lỗi:**
```
Lỗi kết nối server
```

**Nguyên nhân:**
- Backend không chạy
- Port sai
- Firewall blocking
- Network issues

**Cách khắc phục:**

#### A. Kiểm tra Backend
```bash
# Kiểm tra process
ps aux | grep node

# Kiểm tra port
netstat -tulpn | grep :5000

# Restart backend
cd backend
npm start
```

#### B. Kiểm tra Environment Variables
```env
# Frontend .env
REACT_APP_API_URL=http://localhost:5000/api

# Backend .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/system_crawler
```

#### C. Kiểm tra Firewall
```bash
# Windows
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe"

# Linux
sudo ufw allow 5000
```

### 5. **Lỗi MongoDB Connection**

**Lỗi:**
```
MongoDB connection error
```

**Cách khắc phục:**
```bash
# Kiểm tra MongoDB service
sudo systemctl status mongodb

# Khởi động MongoDB
sudo systemctl start mongodb

# Kiểm tra connection
mongo --eval "db.runCommand('ping')"
```

### 6. **Lỗi JWT Token**

**Lỗi:**
```
401 Unauthorized
```

**Cách khắc phục:**
```javascript
// Kiểm tra token trong localStorage
localStorage.getItem('auth-storage');

// Clear và login lại
localStorage.clear();
// Redirect to login
```

## 🛠️ Debug Tools

### 1. **Browser Developer Tools**
```javascript
// Console logging
console.log('Debug info:', data);

// Network tab
// Kiểm tra API requests

// Application tab
// Kiểm tra localStorage, sessionStorage
```

### 2. **React Developer Tools**
- Install React Developer Tools extension
- Kiểm tra component state và props

### 3. **API Testing**
```bash
# Test API với curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Test với Postman
# Import collection và test các endpoints
```

## 📋 Checklist khắc phục

### **Frontend Issues**
- [ ] Kiểm tra console errors
- [ ] Kiểm tra network requests
- [ ] Kiểm tra localStorage
- [ ] Kiểm tra environment variables
- [ ] Restart development server

### **Backend Issues**
- [ ] Kiểm tra server logs
- [ ] Kiểm tra MongoDB connection
- [ ] Kiểm tra API endpoints
- [ ] Kiểm tra CORS configuration
- [ ] Restart backend server

### **Database Issues**
- [ ] Kiểm tra MongoDB service
- [ ] Kiểm tra database connection
- [ ] Kiểm tra collections
- [ ] Backup và restore nếu cần

## 🚀 Best Practices

### 1. **Error Handling**
```javascript
// Luôn wrap API calls trong try-catch
try {
  const response = await api.get('/endpoint');
  return response.data;
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

### 2. **Loading States**
```javascript
const [isLoading, setIsLoading] = useState(false);

// Show loading indicator
{isLoading && <Spinner />}
```

### 3. **Retry Logic**
```javascript
// Implement retry for failed requests
const retry = async (fn, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retry(fn, retries - 1);
    }
    throw error;
  }
};
```

## 📞 Support

Nếu vẫn gặp vấn đề:

1. **Kiểm tra logs** trong console và server
2. **Restart services** (frontend, backend, database)
3. **Clear cache** (browser cache, localStorage)
4. **Check network** connectivity
5. **Verify environment** variables

**Contact:** Tạo issue trên GitHub repository với:
- Screenshot lỗi
- Console logs
- Steps to reproduce
- Environment info

---

**Lưu ý:** Luôn backup dữ liệu trước khi thực hiện các thay đổi lớn! 🔒

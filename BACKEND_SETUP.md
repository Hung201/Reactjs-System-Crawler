# Hướng dẫn Setup Backend NodeJS + MongoDB

## 🚀 Bước 1: Tạo cấu trúc thư mục

```bash
# Tạo thư mục backend
mkdir backend
cd backend

# Tạo cấu trúc thư mục
mkdir config controllers middleware models routes services utils scripts
```

## 📦 Bước 2: Cài đặt dependencies

```bash
# Khởi tạo package.json
npm init -y

# Cài đặt dependencies chính
npm install express mongoose bcryptjs jsonwebtoken cors dotenv helmet express-rate-limit express-validator multer nodemailer winston compression morgan

# Cài đặt dev dependencies
npm install --save-dev nodemon jest supertest
```

## 🔧 Bước 3: Tạo file .env

Tạo file `.env` trong thư mục `backend/`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/system_crawler

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-2024
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🗄️ Bước 4: Cài đặt MongoDB

### Windows:
1. Tải MongoDB từ: https://www.mongodb.com/try/download/community
2. Cài đặt theo hướng dẫn
3. Khởi động MongoDB service

### Mac:
```bash
brew install mongodb-community
brew services start mongodb-community
```

### Ubuntu:
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## 📊 Bước 5: Kết nối MongoDB Compass

1. Mở MongoDB Compass
2. Click "CONNECT" bên cạnh `localhost:27017`
3. Tạo database `system_crawler`
4. Tạo collection đầu tiên `users`

## 🎯 Bước 6: Tạo các file Backend

### 1. server.js (file chính)
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const sourceRoutes = require('./routes/sources');
const dataRoutes = require('./routes/data');
const userRoutes = require('./routes/users');
const actorRoutes = require('./routes/actors');
const logRoutes = require('./routes/logs');
const dashboardRoutes = require('./routes/dashboard');

const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sources', sourceRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/users', userRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch((error) => {
  logger.error('MongoDB connection error:', error);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
```

### 2. utils/logger.js
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'system-crawler-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 3. middleware/errorHandler.js
```javascript
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
```

### 4. middleware/validation.js
```javascript
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg
    });
  }
  next();
};

module.exports = validate;
```

## 🚀 Bước 7: Chạy Backend

```bash
# Cài đặt dependencies
npm install

# Tạo thư mục logs
mkdir logs

# Chạy seed data (tạo dữ liệu mẫu)
node scripts/seedData.js

# Chạy development mode
npm run dev

# Hoặc chạy production mode
npm start
```

## 🧪 Bước 8: Test API

### Test health check:
```bash
curl http://localhost:5000/health
```

### Test login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Test protected route:
```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Bước 9: Cập nhật Frontend

Tạo file `.env` trong thư mục frontend:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 🎉 Kết quả

Sau khi hoàn thành:

✅ **Backend API** chạy trên port 5000
✅ **MongoDB** kết nối thành công
✅ **Frontend** kết nối với backend thực
✅ **Authentication** hoạt động với JWT
✅ **CRUD operations** lưu trữ vào MongoDB

## 📊 Tài khoản demo

- **Admin:** `admin@example.com` / `password123`
- **Editor:** `editor@example.com` / `password123`
- **Viewer:** `viewer@example.com` / `password123`

## 🔧 Troubleshooting

### Lỗi MongoDB connection:
```bash
# Kiểm tra MongoDB service
sudo systemctl status mongodb

# Khởi động MongoDB
sudo systemctl start mongodb
```

### Lỗi port đã được sử dụng:
```bash
# Thay đổi port trong .env
PORT=5001
```

### Lỗi CORS:
- Kiểm tra origin trong server.js
- Đảm bảo frontend chạy trên port đúng

### Lỗi JWT:
- Kiểm tra JWT_SECRET trong .env
- Đảm bảo token được gửi đúng format 
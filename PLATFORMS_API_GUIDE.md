# Platforms API Guide

## Tổng quan

API Platforms cho phép quản lý các platform bên ngoài như Apify, ScrapingBee, Bright Data, v.v. để tích hợp vào hệ thống.

## Endpoints

### 1. Lấy danh sách platforms
```
GET /api/platforms
```

**Query Parameters:**
- `search`: Tìm kiếm theo tên
- `type`: Lọc theo loại platform
- `isActive`: Lọc theo trạng thái hoạt động
- `page`: Số trang
- `limit`: Số lượng item mỗi trang

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "platform_id",
      "name": "Apify Platform",
      "type": "apify",
      "description": "Apify platform integration",
      "apiToken": "encrypted_token",
      "baseURL": "https://api.apify.com/v2",
      "isActive": true,
      "testStatus": "success",
      "lastTested": "2025-01-14T06:37:16.741Z",
      "createdAt": "2025-01-14T06:36:07.749Z",
      "updatedAt": "2025-01-14T06:37:16.742Z"
    }
  ]
}
```

### 2. Lấy platform theo ID
```
GET /api/platforms/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "platform_id",
    "name": "Apify Platform",
    "type": "apify",
    "description": "Apify platform integration",
    "apiToken": "encrypted_token",
    "baseURL": "https://api.apify.com/v2",
    "isActive": true,
    "testStatus": "success",
    "lastTested": "2025-01-14T06:37:16.741Z",
    "createdAt": "2025-01-14T06:36:07.749Z",
    "updatedAt": "2025-01-14T06:37:16.742Z"
  }
}
```

### 3. Tạo platform mới
```
POST /api/platforms
```

**Request Body:**
```json
{
  "name": "Apify Platform",
  "type": "apify",
  "description": "Apify platform integration",
  "apiToken": "apify_api_token_here",
  "baseURL": "https://api.apify.com/v2"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_platform_id",
    "name": "Apify Platform",
    "type": "apify",
    "description": "Apify platform integration",
    "apiToken": "encrypted_token",
    "baseURL": "https://api.apify.com/v2",
    "isActive": true,
    "testStatus": "success",
    "lastTested": "2025-01-14T06:37:16.741Z",
    "createdAt": "2025-01-14T06:36:07.749Z",
    "updatedAt": "2025-01-14T06:37:16.742Z"
  }
}
```

### 4. Cập nhật platform
```
PUT /api/platforms/:id
```

**Request Body:**
```json
{
  "name": "Updated Apify Platform",
  "description": "Updated description",
  "apiToken": "new_api_token",
  "baseURL": "https://api.apify.com/v2"
}
```

### 5. Xóa platform
```
DELETE /api/platforms/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Platform deleted successfully"
}
```

### 6. Test connection platform
```
POST /api/platforms/:id/test
```

**Response:**
```json
{
  "success": true,
  "data": {
    "testStatus": "success",
    "lastTested": "2025-01-14T06:37:16.741Z",
    "testMessage": "Connection successful"
  }
}
```

### 7. Test tất cả platforms
```
POST /api/platforms/test-all
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "successful": 2,
    "failed": 1,
    "results": [
      {
        "platformId": "platform_1",
        "status": "success",
        "message": "Connection successful"
      },
      {
        "platformId": "platform_2",
        "status": "failed",
        "message": "Invalid API token"
      }
    ]
  }
}
```

### 8. Lấy thống kê platforms
```
GET /api/platforms/stats/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPlatforms": 5,
    "activePlatforms": 4,
    "successfulConnections": 3,
    "failedConnections": 1,
    "platformTypes": {
      "apify": 3,
      "scrapingbee": 1,
      "brightdata": 1
    }
  }
}
```

### 9. Lấy danh sách loại platform
```
GET /api/platforms/types/available
```

**Response:**
```json
{
  "success": true,
  "data": ["apify", "scrapingbee", "brightdata", "custom"]
}
```

## Loại Platform Hỗ Trợ

### 1. Apify
- **Type**: `apify`
- **Base URL**: `https://api.apify.com/v2`
- **Mô tả**: Web scraping và automation platform với nhiều actors có sẵn

### 2. ScrapingBee
- **Type**: `scrapingbee`
- **Base URL**: `https://app.scrapingbee.com/api/v1`
- **Mô tả**: Web scraping API service với proxy rotation

### 3. Bright Data
- **Type**: `brightdata`
- **Base URL**: `https://api.brightdata.com`
- **Mô tả**: Data collection platform với residential proxies

### 4. Custom Platform
- **Type**: `custom`
- **Base URL**: Tùy chỉnh
- **Mô tả**: Custom platform integration

## Error Handling

Tất cả endpoints đều trả về response format:
```json
{
  "success": boolean,
  "data": any,
  "error": "error_message" // chỉ có khi success = false
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Authentication

Tất cả API calls cần có Bearer token trong header:
```
Authorization: Bearer <your_jwt_token>
```

## Ví dụ Sử dụng

### JavaScript/React
```javascript
import { platformsAPI } from '../services/api';

// Lấy danh sách platforms
const loadPlatforms = async () => {
  try {
    const response = await platformsAPI.getAll();
    if (response.success) {
      console.log('Platforms:', response.data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Tạo platform mới
const createPlatform = async (platformData) => {
  try {
    const response = await platformsAPI.create(platformData);
    if (response.success) {
      console.log('Platform created:', response.data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Test connection
const testConnection = async (platformId) => {
  try {
    const response = await platformsAPI.testConnection(platformId);
    if (response.success) {
      console.log('Test result:', response.data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### cURL
```bash
# Lấy danh sách platforms
curl -X GET "http://localhost:5000/api/platforms" \
  -H "Authorization: Bearer your_token_here"

# Tạo platform mới
curl -X POST "http://localhost:5000/api/platforms" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Apify Platform",
    "type": "apify",
    "description": "My Apify integration",
    "apiToken": "apify_api_token_here"
  }'

# Test connection
curl -X POST "http://localhost:5000/api/platforms/platform_id/test" \
  -H "Authorization: Bearer your_token_here"
```

## Lưu Ý

1. **API Token Security**: API tokens được mã hóa trước khi lưu vào database
2. **Rate Limiting**: Có thể áp dụng rate limiting cho các API calls
3. **Validation**: Tất cả input data được validate trước khi xử lý
4. **Error Logging**: Tất cả errors được log để debugging
5. **CORS**: API hỗ trợ CORS cho frontend integration

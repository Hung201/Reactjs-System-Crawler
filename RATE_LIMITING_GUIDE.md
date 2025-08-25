# Rate Limiting Guide

## Tổng quan

Hệ thống rate limiting đã được cải tiến để hỗ trợ nhiều người dùng đồng thời với các tính năng sau:

### 1. **User-Specific Rate Limiting**
- **Global Limit**: 100 requests/phút cho toàn bộ hệ thống
- **Per User Limit**: 30 requests/phút cho mỗi người dùng
- **Campaign API**: 50 requests/phút global, 20 requests/phút/user

### 2. **Smart Retry Logic**
- **Exponential Backoff**: Tự động retry với delay tăng dần (2s, 4s, 8s)
- **Server 429 Handling**: Tự động retry sau khi nhận 429 từ server
- **Max Retries**: Tối đa 3 lần retry cho mỗi request

### 3. **Memory Management**
- **Auto Cleanup**: Tự động dọn dẹp cache mỗi 5 phút
- **Memory Leak Prevention**: Tránh memory leak khi có nhiều user

## Cấu hình

### Global API (`src/services/api.js`)
```javascript
const rateLimiter = {
    maxRequests: 100,           // Global limit
    maxRequestsPerUser: 30,     // Per user limit
    timeWindow: 60000,          // 1 phút
};
```

### Campaign API (`src/services/campaignService.js`)
```javascript
const campaignRateLimiter = {
    maxRequests: 50,            // Global limit
    maxRequestsPerUser: 20,     // Per user limit
    timeWindow: 60000,          // 1 phút
};
```

## Tính năng

### 1. **User Identification**
- Tự động extract user ID từ JWT token
- Fallback cho trường hợp không có user ID
- Tracking riêng biệt cho từng user

### 2. **Error Handling**
- **Rate Limit**: Hiển thị thông báo thân thiện
- **Network Error**: Hướng dẫn kiểm tra kết nối
- **Timeout**: Thông báo và retry tự động

### 3. **Performance**
- **Non-blocking**: Không block UI khi rate limit
- **Efficient**: Sử dụng Map để tracking nhanh
- **Scalable**: Hỗ trợ hàng trăm user đồng thời

## Monitoring

### Console Logs
```javascript
// Global limit hit
console.warn(`Global rate limit exceeded for endpoint: ${endpoint}`);

// User limit hit
console.warn(`User rate limit exceeded for endpoint: ${endpoint}, user: ${userId}`);

// Retry attempts
console.warn(`Retrying request (${retryCount}/3) after ${delay}ms`);
```

### User Feedback
- Toast notifications với icon và duration phù hợp
- Thông báo rõ ràng về loại lỗi
- Hướng dẫn hành động tiếp theo

## Tối ưu hóa

### 1. **Caching**
- Sử dụng React Query để cache data
- Giảm số lượng API calls không cần thiết
- Background refetch thông minh

### 2. **Batch Requests**
- Gộp nhiều requests thành batch khi có thể
- Sử dụng GraphQL để giảm số lượng requests

### 3. **Lazy Loading**
- Load data theo demand
- Pagination cho danh sách lớn
- Infinite scroll thay vì load tất cả

## Troubleshooting

### Rate Limit Hit
1. Kiểm tra console logs để xem loại limit
2. Đợi 1 phút để reset limit
3. Kiểm tra xem có user nào đang spam không

### Performance Issues
1. Kiểm tra memory usage
2. Monitor cleanup interval
3. Tăng limit nếu cần thiết

### User Complaints
1. Giải thích về rate limiting
2. Hướng dẫn cách sử dụng hiệu quả
3. Cân nhắc tăng limit cho VIP users

## Future Improvements

### 1. **Dynamic Limits**
- Tự động điều chỉnh limit dựa trên server load
- Different limits cho different user tiers
- A/B testing cho optimal limits

### 2. **Advanced Analytics**
- Track rate limit hits per user
- Identify problematic patterns
- Predictive rate limiting

### 3. **Server-Side Integration**
- Sync client-side limits với server
- Real-time limit updates
- Distributed rate limiting

## Best Practices

### 1. **Development**
- Test với nhiều user đồng thời
- Monitor memory usage
- Log rate limit events

### 2. **Production**
- Set appropriate limits cho production
- Monitor rate limit hits
- Have fallback mechanisms

### 3. **User Experience**
- Clear error messages
- Graceful degradation
- Proactive user education

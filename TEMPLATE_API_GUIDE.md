# Hướng dẫn sử dụng Template API cho Campaign

## Tổng quan

Tính năng **Template** đã được tích hợp với API backend để lấy danh sách template thực tế từ database. Khi tạo campaign mới, người dùng có thể chọn template từ danh sách có sẵn và hệ thống sẽ tự động điền input schema theo cấu hình của template.

## API Endpoints

### 1. Lấy danh sách templates
```http
GET /api/templates
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60904a192553e56eed12150b",
      "name": "DaisanR281",
      "description": "Template cho website b2b.daisan.vn",
      "website": "b2b.daisan.vn",
      "urlpattern": ".b2b.daisan.vn/",
      "category": "ecommerce",
      "actorId": {
        "id": "689464ac10595b979c15002a",
        "name": "Actor Craw by Class (Latest)",
        "description": "Actor để crawl sản phẩm từ các website"
      },
      "actorType": "web-scraper",
      "input": {
        "url": "https://daisanstore.com/collections/g%E1%BA%A1ch thE1%BA388",
        "paginationPattern": "?page=1",
        "pageStart": 1,
        "pageEnd": 2,
        "productLinkSelecter": ".list-item-img a",
        "titleClass": ".product-detail_title h1",
        "priceClass": ".price",
        "descriptionClass": ".product-attribute",
        "contentClass": ".description-info",
        "thumbnailClass": ".image-slider-item img",
        "imagesClass": ".thumb-slider .swiper-container .swiper-wrapper .swiper-slide",
        "websiteName": "DAISANSTORE",
        "category": "Gạch ốp tường",
        "supplier": "DAISANSTORE",
        "url supplier": "https://daisanstore.com",
        "maxRequestsPerCrawl": 50000,
        "maxProductLinks": 50,
        "isbrowser": false,
        "SkuInImage": false,
        "autoGeneratesku": true,
        "isPrice": true,
        "isThumbnail": true,
        "skuclass": "",
        "includePatterns": [],
        "excludePatterns": ["thumb", "small", "icon", "logo"],
        "productLinkIncludePatterns": ["/products/"],
        "productLinkExcludePatterns": ["gioi-thieu", "tin-tuc", "du-an", "lien-he", "about", "news", "contact", "p"]
      },
      "selectors": {
        "title": ".product-detail_title h1",
        "price": ".price",
        "image": ".image-slider-item img",
        "description": ".product-attribute"
      }
    }
  ]
}
```

## Cách hoạt động

### 1. Khi mở modal tạo campaign
- Hệ thống tự động gọi API `GET /api/templates` để lấy danh sách templates
- Templates được hiển thị trong dropdown "Template" với format: `{name} - {category}`
- Loading state được hiển thị trong khi đang fetch dữ liệu

### 2. Khi chọn template
- Khi người dùng chọn một template, hàm `handleTemplateChange` được gọi
- Hệ thống tìm template theo ID và lấy thông tin `input` của template
- Chuyển đổi `template.input` thành format `input_schema` phù hợp với form
- Tự động điền tất cả các trường trong tab "Input Schema"

### 3. Chuyển đổi dữ liệu
```javascript
// Template input format từ API
{
  "url": "https://example.com",
  "productLinkSelecter": ".product-link",
  "titleClass": ".title",
  // ... các trường khác
}

// Chuyển đổi thành input_schema format
{
  "title": "Template Schema",
  "type": "object",
  "schemaVersion": 1,
  "properties": {
    "url": {
      "title": "Url",
      "type": "string",
      "default": "https://example.com"
    },
    "productLinkSelecter": {
      "title": "Product Link Selecter",
      "type": "string", 
      "default": ".product-link"
    },
    // ... các trường khác
  }
}
```

## Cấu trúc Template từ API

### Các trường chính:
- **`_id`**: ID duy nhất của template
- **`name`**: Tên template
- **`description`**: Mô tả template
- **`website`**: Website mà template được thiết kế cho
- **`urlpattern`**: Pattern URL để nhận diện website
- **`category`**: Danh mục template (ecommerce, news, etc.)
- **`actorId`**: Thông tin actor liên quan
- **`input`**: Cấu hình input schema (quan trọng nhất)
- **`selectors`**: Các CSS selector chính

### Cấu trúc `input` object:
```javascript
{
  // Basic Configuration
  "url": "https://example.com/category",
  "websiteName": "WEBSITE_NAME",
  
  // Pagination
  "paginationPattern": "?page=",
  "pageStart": 1,
  "pageEnd": 5,
  
  // Selectors
  "productLinkSelecter": ".product-link",
  "titleClass": ".product-title",
  "priceClass": ".product-price",
  "descriptionClass": ".product-description",
  "contentClass": ".product-content",
  "thumbnailClass": ".product-thumbnail",
  "imagesClass": ".product-images",
  
  // Patterns
  "productLinkIncludePatterns": ["/products/"],
  "productLinkExcludePatterns": ["/about/", "/contact/"],
  "includePatterns": [],
  "excludePatterns": ["thumb", "small"],
  
  // Settings
  "maxRequestsPerCrawl": 50000,
  "maxProductLinks": 50,
  "isbrowser": false,
  "isPrice": true,
  "isThumbnail": true,
  "autoGeneratesku": true,
  "SkuInImage": false
}
```

## Giao diện người dùng

### 1. Tab "Thông tin cơ bản"
- **Dropdown Template**: Hiển thị danh sách templates từ API
- **Loading State**: Spinner khi đang tải templates
- **Template Info**: Hiển thị thông tin chi tiết khi chọn template
- **Reset Button**: Nút để quay về schema mặc định

### 2. Tab "Input Schema"
- **Template Banner**: Hiển thị thông tin template đang sử dụng
- **Auto-filled Fields**: Các trường đã được điền sẵn từ template
- **Editable**: Vẫn có thể chỉnh sửa các trường sau khi chọn template

### 3. Trang chi tiết Campaign
- **Template Info**: Hiển thị template đã sử dụng trong tab Schema
- **Read-only**: Template không thể thay đổi sau khi đã tạo campaign

## Xử lý lỗi

### 1. API không khả dụng
- Hiển thị dropdown trống
- Log lỗi vào console
- Không ảnh hưởng đến việc tạo campaign

### 2. Template không hợp lệ
- Kiểm tra `template.input` có tồn tại không
- Fallback về schema mặc định nếu template không hợp lệ
- Hiển thị thông báo lỗi cho người dùng

### 3. Dữ liệu không đúng format
- Validate cấu trúc dữ liệu từ API
- Chuyển đổi an toàn các kiểu dữ liệu
- Log warning nếu có trường không hợp lệ

## Cách sử dụng

### 1. Tạo Campaign với Template
1. Mở modal "Tạo Chiến dịch mới"
2. Điền thông tin cơ bản (Tên, Mô tả)
3. Chọn Template từ dropdown (tùy chọn)
4. Chuyển tab "Input Schema" để xem các trường đã được điền
5. Chỉnh sửa các trường theo nhu cầu cụ thể
6. Lưu campaign

### 2. Chỉnh sửa Template
- Template chỉ có thể chọn khi tạo campaign mới
- Sau khi tạo, chỉ có thể chỉnh sửa input schema
- Thông tin template được lưu trong campaign

### 3. Reset Template
- Nhấn nút "Sử dụng schema mặc định" để bỏ template
- Hoặc chọn "Chọn Template (tùy chọn)..." trong dropdown

## Lợi ích

### 1. Tiết kiệm thời gian
- Không cần nhập lại các cấu hình phức tạp
- Tự động điền các CSS selector phù hợp
- Giảm lỗi khi cấu hình thủ công

### 2. Tính nhất quán
- Đảm bảo cấu hình đúng cho từng loại website
- Sử dụng các template đã được test và tối ưu
- Chuẩn hóa cấu trúc dữ liệu

### 3. Dễ bảo trì
- Templates được quản lý tập trung trên backend
- Có thể cập nhật template mà không cần deploy frontend
- Lịch sử thay đổi template được theo dõi

## Tương lai

### 1. Tính năng có thể mở rộng
- Tạo template mới từ giao diện
- Chỉnh sửa template hiện có
- Import/export template
- Phân quyền template theo user/role

### 2. Cải tiến UX
- Preview template trước khi chọn
- So sánh template với schema hiện tại
- Gợi ý template dựa trên URL nhập vào
- Template favorites cho user

### 3. Tích hợp nâng cao
- Template versioning
- Template testing
- Template sharing giữa các team
- Template marketplace

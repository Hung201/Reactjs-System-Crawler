# Hướng dẫn sử dụng tính năng Chiến dịch (Campaigns)

## Tổng quan

Tính năng **Chiến dịch** cho phép bạn tạo và quản lý các chiến dịch crawl dữ liệu với cấu hình `input_schema` phức tạp, tương tự như giao diện của Apify platform. Mỗi chiến dịch có thể được cấu hình với các tham số chi tiết để crawl dữ liệu từ các website khác nhau.

## Tính năng chính

- ✅ **Quản lý nhiều chiến dịch**: Tạo, chỉnh sửa, xóa và theo dõi trạng thái các chiến dịch
- ✅ **Cấu hình Input Schema phức tạp**: Hỗ trợ schema "Multi-Website Product Crawler" với nhiều trường cấu hình
- ✅ **Giao diện thân thiện**: Hai chế độ nhập liệu - Manual và JSON
- ✅ **Phân loại theo trạng thái**: Bản nháp, Đang chạy, Tạm dừng, Hoàn thành
- ✅ **Tìm kiếm và lọc**: Tìm kiếm theo tên và lọc theo trạng thái
- ✅ **Xem chi tiết**: Trang chi tiết cho từng chiến dịch với lịch sử chạy

## Cách sử dụng

### 1. Truy cập tính năng
- Đăng nhập vào hệ thống
- Chọn menu **"Chiến dịch"** từ sidebar
- Bạn sẽ thấy danh sách các chiến dịch hiện có

### 2. Tạo chiến dịch mới
- Nhấn nút **"Tạo chiến dịch"** (nút xanh)
- Điền thông tin cơ bản:
  - **Tên chiến dịch**: Tên mô tả cho chiến dịch
  - **Mô tả**: Mô tả chi tiết về mục đích của chiến dịch
  - **Trạng thái**: Chọn trạng thái ban đầu (thường là "Bản nháp")

### 3. Cấu hình Input Schema
Chuyển sang tab **"Input Schema"** để cấu hình chi tiết:

#### Chế độ nhập liệu
- **Manual**: Sử dụng form trực quan với các trường được phân loại
- **JSON**: Nhập trực tiếp JSON schema (dành cho người dùng nâng cao)

#### Các phần cấu hình (Manual Mode)

##### Basic Configuration
- **URL**: URL trang category hoặc sản phẩm để bắt đầu crawl
- **Website Name**: Tên website để tạo SKU (ví dụ: "DAISAN")

##### Pagination
- **Pagination Pattern**: Mẫu URL phân trang (ví dụ: "?page=", "/page/", "&page=")
- **Page Start**: Trang bắt đầu (mặc định: 1)
- **Page End**: Trang kết thúc (mặc định: 5)

##### Selectors
- **Product Link Selector**: CSS selector cho link sản phẩm (ví dụ: ".list-item-img a")
- **Title Selector**: CSS selector cho tiêu đề sản phẩm (ví dụ: ".product-detail_title h1")
- **Price Selector**: CSS selector cho giá sản phẩm (ví dụ: ".price")
- **SKU Selector**: CSS selector cho SKU (để trống để tự động tạo)
- **Description Selector**: CSS selector cho mô tả sản phẩm (ví dụ: ".product-shipping")
- **Content Selector**: CSS selector cho nội dung HTML sản phẩm (ví dụ: ".product-description")

##### Images
- **Thumbnail Selector**: CSS selector cho ảnh thumbnail (ví dụ: ".image-slider-item img")
- **Images Selector**: CSS selector cho ảnh sản phẩm (ví dụ: ".swiper-slide img")

##### Patterns
- **Product Link Include Patterns**: Các pattern URL mà link sản phẩm PHẢI chứa (ví dụ: ["gach-"])
- **Product Link Exclude Patterns**: Các pattern URL để loại trừ khỏi link sản phẩm (ví dụ: ["gioi-thieu", "tin-tuc"])
- **Include Patterns (Images)**: Các pattern URL để bao gồm ảnh (để trống cho tất cả)
- **Exclude Patterns (Images)**: Các pattern URL để loại trừ ảnh (ví dụ: ["thumb", "small", "icon", "logo"])

##### Settings
**Boolean Settings:**
- **SKU in Image**: Chỉ bao gồm ảnh chứa SKU trong URL
- **Auto Generate SKU**: Tự động tạo SKU nếu không tìm thấy trên trang
- **Price Required**: Bỏ qua sản phẩm không có giá (true = bỏ qua, false = bao gồm tất cả)
- **Thumbnail Required**: Bỏ qua sản phẩm không có thumbnail (true = bỏ qua, false = bao gồm tất cả)
- **Use Browser API**: Sử dụng API bên ngoài để khám phá link sản phẩm

**Supplier Information:**
- **Supplier**: Tên nhà cung cấp cho sản phẩm (ví dụ: "DAISAN")
- **Supplier URL**: URL website nhà cung cấp (ví dụ: "https://b2b.daisan.vn")

**Limits:**
- **Max Requests per Crawl**: Số lượng request tối đa có thể thực hiện (mặc định: 50000)
- **Max Product Links**: Số lượng link sản phẩm tối đa để thu thập (mặc định: 50)

### 4. Lưu và chạy chiến dịch
- Nhấn **"Tạo"** để lưu chiến dịch
- Chiến dịch sẽ được tạo với trạng thái "Bản nháp"
- Nhấn vào tên chiến dịch để xem chi tiết và chạy

### 5. Quản lý chiến dịch
- **Xem danh sách**: Tất cả chiến dịch được hiển thị với thông tin cơ bản
- **Tìm kiếm**: Sử dụng ô tìm kiếm để tìm chiến dịch theo tên
- **Lọc**: Sử dụng dropdown để lọc theo trạng thái
- **Chỉnh sửa**: Nhấn nút chỉnh sửa để cập nhật cấu hình
- **Xóa**: Nhấn nút xóa để xóa chiến dịch (có xác nhận)

### 6. Theo dõi chiến dịch
- **Trang chi tiết**: Xem thông tin đầy đủ về chiến dịch
- **Lịch sử chạy**: Theo dõi các lần chạy trước đó
- **Cài đặt**: Quản lý cấu hình nâng cao

## Cấu trúc Input Schema được hỗ trợ

Tính năng hỗ trợ schema "Multi-Website Product Crawler" với cấu trúc:

```json
{
  "title": "Multi-Website Product Crawler",
  "type": "object",
  "schemaVersion": 1,
  "properties": {
    "url": { "type": "string", "description": "Category or product page URL to start crawling" },
    "paginationPattern": { "type": "string", "description": "Pattern for pagination URLs" },
    "pageStart": { "type": "integer", "default": 1 },
    "pageEnd": { "type": "integer", "default": 5 },
    "productLinkSelector": { "type": "string", "description": "CSS selector for product links" },
    "productLinkIncludePatterns": { "type": "array", "items": { "type": "string" } },
    "productLinkExcludePatterns": { "type": "array", "items": { "type": "string" } },
    "titleClass": { "type": "string", "description": "CSS selector for product title" },
    "descriptionClass": { "type": "string", "description": "CSS selector for product description" },
    "priceClass": { "type": "string", "description": "CSS selector for product price" },
    "skuClass": { "type": "string", "description": "CSS selector for product SKU" },
    "contentClass": { "type": "string", "description": "CSS selector for product content HTML" },
    "thumbnailClass": { "type": "string", "description": "CSS selector for product thumbnail" },
    "imagesClass": { "type": "string", "description": "CSS selector for product images" },
    "includePatterns": { "type": "array", "items": { "type": "string" } },
    "excludePatterns": { "type": "array", "items": { "type": "string" } },
    "skuInImage": { "type": "boolean", "description": "Only include images containing SKU in URL" },
    "autoGenerateSku": { "type": "boolean", "default": true },
    "websiteName": { "type": "string", "description": "Website name for SKU generation" },
    "isPrice": { "type": "boolean", "default": true },
    "isThumbnail": { "type": "boolean", "default": false },
    "supplier": { "type": "string", "description": "Supplier name for products" },
    "url_supplier": { "type": "string", "description": "Supplier website URL" },
    "maxRequestsPerCrawl": { "type": "integer", "default": 50000 },
    "maxProductLinks": { "type": "integer", "default": 50 },
    "isBrowser": { "type": "boolean", "default": false }
  },
  "required": ["url"]
}
```

## Trạng thái chiến dịch

- **Bản nháp**: Chiến dịch đang được tạo/chỉnh sửa, chưa sẵn sàng chạy
- **Đang chạy**: Chiến dịch đang thực hiện crawl dữ liệu
- **Tạm dừng**: Chiến dịch đã tạm dừng, có thể tiếp tục sau
- **Hoàn thành**: Chiến dịch đã hoàn thành việc crawl

## Lưu ý quan trọng

1. **URL bắt buộc**: Trường "URL" là bắt buộc trong mọi cấu hình
2. **CSS Selectors**: Đảm bảo các CSS selector chính xác để crawl dữ liệu đúng
3. **Patterns**: Sử dụng patterns để lọc và bao gồm/loại trừ URL phù hợp
4. **Giới hạn**: Thiết lập giới hạn phù hợp để tránh quá tải hệ thống
5. **Testing**: Luôn test cấu hình trên một số trang nhỏ trước khi chạy toàn bộ

## Xử lý sự cố

### Vấn đề thường gặp

1. **Không crawl được dữ liệu**
   - Kiểm tra CSS selectors có chính xác không
   - Xác nhận URL bắt đầu có thể truy cập được
   - Kiểm tra patterns include/exclude

2. **Crawl quá chậm**
   - Giảm số lượng trang (pageEnd)
   - Tăng giới hạn maxRequestsPerCrawl
   - Kiểm tra cài đặt isBrowser

3. **Dữ liệu không đầy đủ**
   - Kiểm tra các selector cho title, price, description
   - Xác nhận patterns không loại trừ nhầm dữ liệu
   - Kiểm tra cài đặt isPrice và isThumbnail

### Hỗ trợ kỹ thuật

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra log lỗi trong trang chi tiết chiến dịch
2. Xác nhận cấu hình input_schema hợp lệ
3. Liên hệ admin để được hỗ trợ

## API Endpoints (Giả định)

```
GET    /api/campaigns              # Lấy danh sách chiến dịch
POST   /api/campaigns              # Tạo chiến dịch mới
GET    /api/campaigns/:id          # Lấy chi tiết chiến dịch
PUT    /api/campaigns/:id          # Cập nhật chiến dịch
DELETE /api/campaigns/:id          # Xóa chiến dịch
POST   /api/campaigns/:id/run      # Chạy chiến dịch
GET    /api/campaigns/:id/runs     # Lấy lịch sử chạy
```

---

**Lưu ý**: Tính năng này được thiết kế để tương thích với các hệ thống crawl dữ liệu hiện đại và có thể được mở rộng để hỗ trợ các loại schema khác trong tương lai.

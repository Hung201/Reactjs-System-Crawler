# 📋 Campaign Input Schema Fields - System Crawler

## 🎯 Tổng quan

Modal chỉnh sửa campaign đã được cập nhật với đầy đủ các trường cần thiết cho việc cấu hình web crawler. Dưới đây là danh sách chi tiết các trường đã được thêm.

## 🔧 Các trường mới đã thêm

### **1. Boolean Fields (Checkboxes)**

#### **isPrice: true**
- **Mô tả**: Bật/tắt việc trích xuất giá sản phẩm
- **Mặc định**: `true`
- **Sử dụng**: Khi cần lấy thông tin giá từ trang sản phẩm

#### **isThumbnail: true**
- **Mô tả**: Bật/tắt việc trích xuất ảnh thumbnail
- **Mặc định**: `true`
- **Sử dụng**: Khi cần lấy ảnh đại diện sản phẩm

#### **autoGenerateSku: true**
- **Mô tả**: Tự động tạo SKU nếu không tìm thấy
- **Mặc định**: `true`
- **Sử dụng**: Tạo mã SKU tự động từ tên sản phẩm

#### **skuInImage: false**
- **Mô tả**: SKU có được nhúng trong ảnh không
- **Mặc định**: `false`
- **Sử dụng**: Khi SKU được hiển thị trong ảnh sản phẩm

#### **isBrowser: false**
- **Mô tả**: Sử dụng browser để crawl (cho JavaScript-heavy sites)
- **Mặc định**: `false`
- **Sử dụng**: Khi website cần JavaScript để render nội dung

### **2. Numeric Fields**

#### **maxRequestsPerCrawl: 50000**
- **Mô tả**: Số lượng request tối đa cho mỗi lần crawl
- **Mặc định**: `50000`
- **Sử dụng**: Giới hạn số request để tránh quá tải server

### **3. Image Patterns Section**

#### **includePatterns: []**
- **Mô tả**: Các pattern URL ảnh cần bao gồm
- **Mặc định**: `[]`
- **Ví dụ**: `["product", "main"]`
- **Sử dụng**: Lọc ảnh sản phẩm chính

#### **excludePatterns: []**
- **Mô tả**: Các pattern URL ảnh cần loại trừ
- **Mặc định**: `[]`
- **Ví dụ**: `["thumb", "small", "icon", "logo"]`
- **Sử dụng**: Loại bỏ ảnh thumbnail, icon, logo

## 📊 Cấu trúc Schema hoàn chỉnh

```json
{
  "title": "Multi-Website Product Crawler",
  "type": "object",
  "schemaVersion": 1,
  "properties": {
    "url": { "default": "" },
    "websiteName": { "default": "" },
    "paginationPattern": { "default": "?page=" },
    "pageStart": { "default": 1 },
    "pageEnd": { "default": 5 },
    "productLinkSelector": { "default": ".list-item-img a" },
    "titleClass": { "default": ".product-detail_title h1" },
    "priceClass": { "default": ".price" },
    "skuClass": { "default": "" },
    "descriptionClass": { "default": ".product-attribute" },
    "contentClass": { "default": ".description-info" },
    "thumbnailClass": { "default": ".image-slider-item img" },
    "imagesClass": { "default": ".thumb-slider .swiper-container .swiper-wrapper .swiper-slide" },
    "productLinkIncludePatterns": { "default": [] },
    "productLinkExcludePatterns": { "default": [] },
    "includePatterns": { "default": [] },
    "excludePatterns": { "default": [] },
    "category": { "default": "" },
    "supplier": { "default": "" },
    "url_supplier": { "default": "" },
    "maxProductLinks": { "default": 50 },
    "maxRequestsPerCrawl": { "default": 50000 },
    "isPrice": { "default": true },
    "isThumbnail": { "default": true },
    "autoGenerateSku": { "default": true },
    "skuInImage": { "default": false },
    "isBrowser": { "default": false }
  }
}
```

## 🎨 Giao diện Modal

### **Các Section chính:**

1. **Basic Configuration**
   - URL, Website Name

2. **Pagination**
   - Pagination Pattern, Page Start, Page End

3. **Selectors**
   - Tất cả CSS selectors cho các element

4. **Product Link Patterns**
   - Include/Exclude patterns cho product links

5. **Image Patterns** ⭐ **MỚI**
   - Include/Exclude patterns cho images

6. **Additional Settings**
   - Category, Supplier, Limits
   - **Crawl Options** ⭐ **MỚI** (Boolean fields)

## 🔄 Cách sử dụng

### **1. Tạo Campaign mới:**
1. Mở modal "Tạo chiến dịch"
2. Chọn tab "Input Schema"
3. Điền các thông tin cơ bản
4. Cấu hình các selectors
5. Thêm patterns cho product links và images
6. Bật/tắt các options trong "Crawl Options"

### **2. Chỉnh sửa Campaign:**
1. Mở modal "Chỉnh sửa chiến dịch"
2. Chọn tab "Input Schema"
3. Các trường sẽ được load với giá trị hiện tại
4. Thay đổi các cấu hình cần thiết
5. Lưu thay đổi

### **3. JSON Mode:**
- Chuyển sang tab "JSON" để chỉnh sửa trực tiếp
- Paste schema JSON hoàn chỉnh
- Validate và lưu

## ⚙️ Cấu hình mẫu cho DAISANB2B

```json
{
  "url": "https://b2b.daisan.vn/products/gach-op-tuong",
  "websiteName": "DAISANB2B",
  "paginationPattern": "?page=",
  "pageStart": 1,
  "pageEnd": 2,
  "productLinkSelector": ".list-item-img a",
  "productLinkIncludePatterns": ["gach-"],
  "productLinkExcludePatterns": ["gioi-thieu", "tin-tuc", "du-an", "lien-he", "about", "news", "contact", "p="],
  "titleClass": ".product-detail_title h1",
  "descriptionClass": ".product-attribute",
  "priceClass": ".price",
  "skuClass": "",
  "contentClass": ".description-info",
  "thumbnailClass": ".image-slider-item img",
  "imagesClass": ".thumb-slider.swiper-container.swiper-wrapper .swiper-slide",
  "includePatterns": [],
  "excludePatterns": ["thumb", "small", "icon", "logo"],
  "category": "Gạch ốp tường",
  "supplier": "DAISANB2B",
  "url_supplier": "https://b2b.daisan.vn",
  "maxProductLinks": 30,
  "maxRequestsPerCrawl": 50000,
  "isPrice": true,
  "isThumbnail": true,
  "autoGenerateSku": true,
  "skuInImage": false,
  "isBrowser": false
}
```

## 🚀 Lợi ích của các trường mới

### **1. Kiểm soát tốt hơn:**
- Bật/tắt từng tính năng crawl
- Giới hạn số lượng request
- Lọc ảnh chính xác hơn

### **2. Hiệu suất cao hơn:**
- Chỉ crawl những gì cần thiết
- Tránh crawl dữ liệu không cần thiết
- Tối ưu thời gian xử lý

### **3. Dữ liệu chất lượng:**
- Lọc ảnh thumbnail, icon
- Tự động tạo SKU khi cần
- Xử lý JavaScript-heavy sites

## 📝 Lưu ý quan trọng

1. **Boolean fields**: Mặc định được bật cho các tính năng cơ bản
2. **Image patterns**: Quan trọng để lọc ảnh chất lượng cao
3. **Max requests**: Điều chỉnh theo khả năng server
4. **Browser mode**: Chỉ bật khi cần thiết (chậm hơn)

## 🔧 Troubleshooting

### **Lỗi thường gặp:**
1. **Không crawl được ảnh**: Kiểm tra `imagesClass` và `excludePatterns`
2. **Thiếu giá**: Đảm bảo `isPrice: true` và `priceClass` đúng
3. **Chậm**: Giảm `maxRequestsPerCrawl` hoặc tắt `isBrowser`
4. **SKU trống**: Bật `autoGenerateSku: true`

---

**Modal đã được cập nhật hoàn chỉnh với tất cả các trường cần thiết!** 🎉

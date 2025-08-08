# File-Based Storage Model cho Actors

## Tổng quan

Thay vì lưu code actor vào database, hệ thống giờ sử dụng mô hình **file-based storage** - lưu trữ code trong file system và chỉ lưu metadata trong database.

## Cấu trúc thư mục

```
/actors_storage/                    # Thư mục gốc chứa tất cả actor
└── user_123/                      # Mỗi user một thư mục riêng
    └── actor_abc456/              # Mỗi actor một thư mục con
        ├── main.js                # File chính của actor
        ├── package.json           # Khai báo dependencies
        ├── README.md              # Mô tả actor (tùy chọn)
        ├── input_schema.json      # Schema cho input (tùy chọn)
        ├── Dockerfile             # Docker configuration
        ├── .gitignore             # Git ignore rules
        ├── .editorconfig          # Editor configuration
        ├── .prettierrc            # Prettier configuration
        ├── eslint.config.mjs      # ESLint configuration
        └── logs/                  # Thư mục chứa logs
            ├── build_001.log      # Build logs
            └── run_001.log        # Run logs
```

## API Endpoints mới

### 1. Lưu file đơn lẻ
```javascript
PUT /api/actors/:actorId/files/:filePath
Body: { content: "file content" }
```

### 2. Lưu nhiều file cùng lúc
```javascript
POST /api/actors/:actorId/files
Body: { 
  files: [
    { path: "main.js", content: "..." },
    { path: "package.json", content: "..." }
  ]
}
```

### 3. Lấy danh sách file
```javascript
GET /api/actors/:actorId/files
Response: { files: ["main.js", "package.json", ...] }
```

### 4. Lấy nội dung file
```javascript
GET /api/actors/:actorId/files/:filePath
Response: { content: "file content" }
```

## Database Schema (chỉ metadata)

```javascript
// Collection: actors
{
  "_id": "actor_abc456",
  "userId": "user_123",
  "name": "Shopee Crawler",
  "description": "Crawl sản phẩm từ Shopee",
  "path": "/actors_storage/user_123/actor_abc456/",
  "files": ["main.js", "package.json", "README.md"],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:35:00Z",
  "public": false,
  "tags": ["crawler", "shopee"],
  "status": "ready", // ready, building, running, error
  "version": "0.0.1"
}
```

## Quy trình Save/Build

### 1. Khi user nhấn Save
```javascript
// Frontend
const handleSave = () => {
  // 1. Lưu vào localStorage (immediate feedback)
  localStorage.setItem(`actor_${id}_${selectedFile}`, fileContent);
  
  // 2. Gửi đến backend để lưu vào file system
  actorsAPI.saveFile(actorId, selectedFile, fileContent);
};
```

### 2. Backend xử lý
```javascript
// Backend
const saveFile = async (actorId, filePath, content) => {
  const actorPath = `/actors_storage/${userId}/${actorId}/`;
  
  // Tạo thư mục nếu chưa có
  fs.mkdirSync(actorPath, { recursive: true });
  
  // Lưu file
  fs.writeFileSync(`${actorPath}/${filePath}`, content);
  
  // Cập nhật metadata trong database
  await Actor.updateOne(
    { _id: actorId },
    { 
      $addToSet: { files: filePath },
      updatedAt: new Date()
    }
  );
};
```

### 3. Khi user nhấn Build
```javascript
// Backend
const buildActor = async (actorId) => {
  const actorPath = `/actors_storage/${userId}/${actorId}/`;
  
  // Chạy npm install
  const install = spawn('npm', ['install'], { cwd: actorPath });
  
  // Build Docker image
  const build = spawn('docker', ['build', '-t', `actor-${actorId}`, '.'], { 
    cwd: actorPath 
  });
  
  // Lưu build log
  const buildLog = `${actorPath}/logs/build_${Date.now()}.log`;
  build.stdout.pipe(fs.createWriteStream(buildLog));
};
```

## Ưu điểm của mô hình này

### ✅ Hiệu suất cao
- Đọc/ghi file trực tiếp trên disk nhanh hơn database
- Không bị giới hạn dung lượng như MongoDB (16MB/document)

### ✅ Dễ tích hợp
- Có thể dùng `child_process` hoặc Docker trực tiếp
- Dễ zip/export actor để chia sẻ
- Tương thích với các tool development khác

### ✅ Quản lý version
- Có thể implement Git-like versioning
- Dễ dàng fork/clone actor
- Backup và restore đơn giản

### ✅ Phân quyền tốt
- Mỗi user có thư mục riêng
- Dễ implement access control
- Có thể share thư mục cho team

## Implementation Notes

### Frontend Changes
- ✅ Đã cập nhật `ActorEditor.js` để sử dụng API mới
- ✅ Đã cập nhật `api.js` với endpoints mới
- ✅ Vẫn giữ localStorage cho immediate feedback

### Backend Requirements
- Cần implement các endpoints mới
- Cần tạo thư mục `/actors_storage/` 
- Cần xử lý file permissions
- Cần implement build process với Docker

### Security Considerations
- Validate file paths để tránh path traversal
- Set proper file permissions
- Sanitize file content
- Implement rate limiting cho file operations

## Migration từ Database Storage

Nếu có dữ liệu cũ trong database:

```javascript
// Migration script
const migrateActorToFileSystem = async (actorId) => {
  const actor = await Actor.findById(actorId);
  const actorPath = `/actors_storage/${actor.userId}/${actorId}/`;
  
  // Tạo thư mục
  fs.mkdirSync(actorPath, { recursive: true });
  
  // Lưu từng file
  for (const [filePath, content] of Object.entries(actor.sourceCode)) {
    fs.writeFileSync(`${actorPath}/${filePath}`, content);
  }
  
  // Cập nhật metadata
  await Actor.updateOne(
    { _id: actorId },
    { 
      $set: { path: actorPath },
      $unset: { sourceCode: 1 }
    }
  );
};
```

## Kết luận

Mô hình file-based storage này sẽ:
- 🚀 Cải thiện hiệu suất đáng kể
- 🛠️ Dễ dàng tích hợp với Docker và build tools
- 📁 Tổ chức code rõ ràng và dễ quản lý
- 🔐 Bảo mật tốt hơn với phân quyền file system
- 💾 Không bị giới hạn dung lượng như database

# Actor Editor API Backend

## Tổng quan
Hệ thống Actor Editor cần các API endpoints để quản lý source code, build và chạy Actor giống như Apify Web IDE.

## API Endpoints

### 1. Lấy thông tin Actor
```http
GET /api/actors/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "actor_id",
    "actorName": "My Actor 1",
    "actorId": "daisan/my-actor-1",
    "description": "A web scraping actor",
    "version": "0.0.1",
    "status": "ready",
    "uploadedBy": {
      "_id": "user_id",
      "name": "User Name"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Lấy source code của file
```http
GET /api/actors/:id/source?filePath=src/main.js
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filePath": "src/main.js",
    "content": "import { Actor } from 'apify';...",
    "language": "javascript"
  }
}
```

### 3. Lưu source code
```http
POST /api/actors/:id/source
```

**Request Body:**
```json
{
  "filePath": "src/main.js",
  "content": "import { Actor } from 'apify';..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "File saved successfully"
}
```

### 4. Build Actor
```http
POST /api/actors/:id/build
```

**Response:**
```json
{
  "success": true,
  "data": {
    "buildId": "build_123",
    "status": "building",
    "message": "Build started successfully"
  }
}
```

### 5. Chạy Actor
```http
POST /api/actors/:id/run
```

**Request Body (optional):**
```json
{
  "input": {
    "startUrls": ["https://example.com"],
    "maxRequestsPerCrawl": 10
  },
  "envVars": {
    "API_KEY": "your_api_key"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "runId": "run_123",
    "status": "running",
    "message": "Actor started successfully"
  }
}
```

### 6. Lấy file structure
```http
GET /api/actors/:id/files
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": ".actor",
      "type": "folder",
      "children": [
        { "name": "actor.json", "type": "file" },
        { "name": "input_schema.json", "type": "file" }
      ]
    },
    {
      "name": "src",
      "type": "folder", 
      "children": [
        { "name": "main.js", "type": "file" }
      ]
    },
    { "name": "package.json", "type": "file" },
    { "name": "Dockerfile", "type": "file" }
  ]
}
```

## Cấu trúc thư mục Actor

Mỗi Actor nên có cấu trúc thư mục như sau:

```
/actors/actor-id/
├── .actor/
│   ├── actor.json
│   └── input_schema.json
├── src/
│   └── main.js
├── package.json
├── Dockerfile
├── README.md
├── .gitignore
├── .dockerignore
├── .editorconfig
├── .prettierrc
└── eslint.config.mjs
```

## File cấu hình

### actor.json
```json
{
  "name": "my-actor-1",
  "version": "0.0.1",
  "description": "A web scraping actor",
  "main": "src/main.js",
  "type": "module",
  "dependencies": {
    "apify": "^3.0.0",
    "crawlee": "^3.0.0"
  }
}
```

### input_schema.json
```json
{
  "title": "My Actor 1 Input",
  "type": "object",
  "schemaVersion": 1,
  "properties": {
    "startUrls": {
      "title": "Start URLs",
      "type": "array",
      "description": "URLs to start crawling from",
      "editor": "urlList",
      "items": {
        "type": "string",
        "pattern": "^https?://"
      }
    },
    "maxRequestsPerCrawl": {
      "title": "Max Requests Per Crawl",
      "type": "integer",
      "description": "Maximum number of pages to crawl",
      "default": 10,
      "minimum": 1,
      "maximum": 1000
    }
  },
  "required": ["startUrls"]
}
```

### package.json
```json
{
  "name": "my-actor-1",
  "version": "0.0.1",
  "description": "A web scraping actor",
  "main": "src/main.js",
  "type": "module",
  "dependencies": {
    "apify": "^3.0.0",
    "crawlee": "^3.0.0"
  },
  "scripts": {
    "start": "node src/main.js"
  }
}
```

## Backend Implementation

### 1. File System Management
```javascript
const fs = require('fs').promises;
const path = require('path');

class ActorFileManager {
  constructor(baseDir = './actors') {
    this.baseDir = baseDir;
  }

  async getActorPath(actorId) {
    return path.join(this.baseDir, actorId);
  }

  async readFile(actorId, filePath) {
    const actorPath = await this.getActorPath(actorId);
    const fullPath = path.join(actorPath, filePath);
    return await fs.readFile(fullPath, 'utf8');
  }

  async writeFile(actorId, filePath, content) {
    const actorPath = await this.getActorPath(actorId);
    const fullPath = path.join(actorPath, filePath);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    
    return await fs.writeFile(fullPath, content, 'utf8');
  }

  async getFileStructure(actorId) {
    const actorPath = await this.getActorPath(actorId);
    return await this.scanDirectory(actorPath);
  }

  async scanDirectory(dirPath, relativePath = '') {
    const items = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const itemPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        const children = await this.scanDirectory(
          path.join(dirPath, entry.name), 
          itemPath
        );
        items.push({
          name: entry.name,
          type: 'folder',
          children
        });
      } else {
        items.push({
          name: entry.name,
          type: 'file'
        });
      }
    }

    return items;
  }
}
```

### 2. Actor Runner
```javascript
const { spawn } = require('child_process');
const Docker = require('dockerode');

class ActorRunner {
  constructor() {
    this.docker = new Docker();
  }

  async runActor(actorId, input = {}, envVars = {}) {
    const runId = `run_${Date.now()}`;
    
    try {
      // Create run directory
      const runDir = path.join('./runs', runId);
      await fs.mkdir(runDir, { recursive: true });

      // Copy actor files
      await this.copyActorFiles(actorId, runDir);

      // Write input.json
      await fs.writeFile(
        path.join(runDir, 'input.json'),
        JSON.stringify(input, null, 2)
      );

      // Set environment variables
      const env = { ...process.env, ...envVars };

      // Run actor
      const result = await this.executeActor(runDir, env);

      return {
        runId,
        status: 'completed',
        result
      };
    } catch (error) {
      return {
        runId,
        status: 'failed',
        error: error.message
      };
    }
  }

  async executeActor(runDir, env) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', ['src/main.js'], {
        cwd: runDir,
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr}`));
        }
      });

      child.on('error', reject);
    });
  }
}
```

### 3. Express Routes
```javascript
const express = require('express');
const router = express.Router();
const ActorFileManager = require('../services/ActorFileManager');
const ActorRunner = require('../services/ActorRunner');

const fileManager = new ActorFileManager();
const runner = new ActorRunner();

// Get actor source file
router.get('/:id/source', async (req, res) => {
  try {
    const { id } = req.params;
    const { filePath } = req.query;
    
    const content = await fileManager.readFile(id, filePath);
    
    res.json({
      success: true,
      data: {
        filePath,
        content,
        language: getLanguageFromExtension(filePath)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Save actor source file
router.post('/:id/source', async (req, res) => {
  try {
    const { id } = req.params;
    const { filePath, content } = req.body;
    
    await fileManager.writeFile(id, filePath, content);
    
    res.json({
      success: true,
      message: 'File saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Build actor
router.post('/:id/build', async (req, res) => {
  try {
    const { id } = req.params;
    const buildId = `build_${Date.now()}`;
    
    // Validate actor files
    await validateActor(id);
    
    res.json({
      success: true,
      data: {
        buildId,
        status: 'completed',
        message: 'Build completed successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Run actor
router.post('/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    const { input, envVars } = req.body;
    
    const result = await runner.runActor(id, input, envVars);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get file structure
router.get('/:id/files', async (req, res) => {
  try {
    const { id } = req.params;
    const structure = await fileManager.getFileStructure(id);
    
    res.json({
      success: true,
      data: structure
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
```

## Security Considerations

1. **File Path Validation**: Validate file paths to prevent directory traversal attacks
2. **Input Validation**: Validate all input data before processing
3. **Resource Limits**: Set limits on file size, execution time, and memory usage
4. **Sandboxing**: Run actors in isolated environments (Docker containers)
5. **Authentication**: Ensure all endpoints require proper authentication

## Testing

Test các API endpoints với curl:

```bash
# Get actor info
curl -X GET "http://localhost:5000/api/actors/actor_id" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get source file
curl -X GET "http://localhost:5000/api/actors/actor_id/source?filePath=src/main.js" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Save source file
curl -X POST "http://localhost:5000/api/actors/actor_id/source" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filePath": "src/main.js", "content": "console.log(\"Hello World\");"}'

# Build actor
curl -X POST "http://localhost:5000/api/actors/actor_id/build" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Run actor
curl -X POST "http://localhost:5000/api/actors/actor_id/run" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input": {"startUrls": ["https://example.com"]}}'
``` 
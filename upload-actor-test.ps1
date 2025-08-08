# Script upload folder actor-test
param(
    [string]$ActorId = "689414f6c4adf33cbf031bf9",
    [string]$FolderPath = "D:\actor-test"
)

$baseUrl = "http://localhost:5000/api/actors/$ActorId/files"

Write-Host "🚀 Bắt đầu upload folder actor-test..." -ForegroundColor Yellow
Write-Host "📂 Folder: $FolderPath" -ForegroundColor Cyan
Write-Host "🎯 Actor ID: $ActorId" -ForegroundColor Cyan

# Function để upload file
function Upload-File {
    param(
        [string]$FilePath,
        [string]$RelativePath
    )
    
    try {
        $fileSize = (Get-Item $FilePath).Length
        $fileName = Split-Path $FilePath -Leaf
        
        $sizeKB = [math]::Round($fileSize/1KB, 2)
        Write-Host "📤 Uploading: $RelativePath ($sizeKB KB)" -ForegroundColor Yellow
        
        # Đọc file content
        $content = Get-Content $FilePath -Raw -Encoding UTF8
        
        # Escape JSON characters
        $content = $content -replace '"', '\"'
        $content = $content -replace "`n", '\n'
        $content = $content -replace "`r", '\r'
        $content = $content -replace "`t", '\t'
        
        $body = @{content = $content} | ConvertTo-Json
        
        # Upload to backend
        $response = Invoke-WebRequest -Uri "$baseUrl/$RelativePath" -Method PUT -Body $body -ContentType "application/json" -TimeoutSec 30
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Uploaded: $RelativePath" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Error: $RelativePath" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Failed: $RelativePath - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function để scan và upload folder
function Upload-Folder {
    param(
        [string]$FolderPath,
        [string]$RelativePath = ""
    )
    
    $totalFiles = 0
    $successFiles = 0
    
    # Đếm tổng số files
    $allFiles = Get-ChildItem $FolderPath -Recurse -File
    $totalFiles = $allFiles.Count
    
    Write-Host "📁 Found $totalFiles files to upload" -ForegroundColor Cyan
    
    # Upload từng file
    foreach ($file in $allFiles) {
        $fileRelativePath = $file.FullName.Replace($FolderPath, "").TrimStart('\')
        $fileRelativePath = $fileRelativePath.Replace('\', '/')
        
        if (Upload-File -FilePath $file.FullName -RelativePath $fileRelativePath) {
            $successFiles++
        }
        
        # Hiển thị progress
        $progress = [math]::Round(($successFiles / $totalFiles) * 100, 1)
        Write-Host "📊 Progress: $successFiles/$totalFiles ($progress%)" -ForegroundColor Blue
    }
    
    return @{
        Total = $totalFiles
        Success = $successFiles
        Failed = ($totalFiles - $successFiles)
    }
}

# Kiểm tra folder có tồn tại không
if (-not (Test-Path $FolderPath)) {
    Write-Host "❌ Folder không tồn tại: $FolderPath" -ForegroundColor Red
    Write-Host "💡 Hãy đảm bảo folder actor-test đã được tạo tại: $FolderPath" -ForegroundColor Yellow
    exit 1
}

# Upload folder
$result = Upload-Folder -FolderPath $FolderPath

Write-Host "✅ Upload completed!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Total files: $($result.Total)" -ForegroundColor White
Write-Host "   Success: $($result.Success)" -ForegroundColor Green
Write-Host "   Failed: $($result.Failed)" -ForegroundColor Red

if ($result.Success -gt 0) {
    Write-Host "🎉 Actor đã được upload thành công!" -ForegroundColor Green
    Write-Host "🚀 Bây giờ bạn có thể:" -ForegroundColor Yellow
    Write-Host "   1. Refresh trang frontend" -ForegroundColor White
    Write-Host "   2. Click Build để build actor" -ForegroundColor White
    Write-Host "   3. Click Run để chạy actor" -ForegroundColor White
}

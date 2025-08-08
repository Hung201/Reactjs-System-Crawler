# Simple upload script with authentication
$ActorId = "689414f6c4adf33cbf031bf9"
$FolderPath = "D:\actor-test"
$baseUrl = "http://localhost:5000/api/actors/$ActorId/files"

# Get token from localStorage (you need to copy this from browser)
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODkxYTVjNjAxMjI5ZWY4ODc3Zjc0ZjEiLCJpYXQiOjE3NTQ1MzQ4MTYsImV4cCI6MTc1NTEzOTYxNn0.oQ2zgiQmt0ezx01Ww8K3MSXJPOENBasKVpZYwdM1Wtk"  # Replace with actual token

Write-Host "Starting upload..." -ForegroundColor Yellow
Write-Host "Folder: $FolderPath" -ForegroundColor Cyan
Write-Host "Actor ID: $ActorId" -ForegroundColor Cyan

# Check if folder exists
if (-not (Test-Path $FolderPath)) {
    Write-Host "ERROR: Folder not found: $FolderPath" -ForegroundColor Red
    exit 1
}

# Check if token is set
if ($token -eq "YOUR_JWT_TOKEN_HERE") {
    Write-Host "ERROR: Please set your JWT token in the script" -ForegroundColor Red
    Write-Host "1. Open browser DevTools (F12)" -ForegroundColor Yellow
    Write-Host "2. Go to Application > Local Storage" -ForegroundColor Yellow
    Write-Host "3. Copy the 'token' value" -ForegroundColor Yellow
    Write-Host "4. Replace 'YOUR_JWT_TOKEN_HERE' in this script" -ForegroundColor Yellow
    exit 1
}

# Get all files
$allFiles = Get-ChildItem $FolderPath -Recurse -File
$totalFiles = $allFiles.Count
$successFiles = 0

Write-Host "Found $totalFiles files to upload" -ForegroundColor Cyan

# Upload each file
foreach ($file in $allFiles) {
    $fileRelativePath = $file.FullName.Replace($FolderPath, "").TrimStart('\')
    $fileRelativePath = $fileRelativePath.Replace('\', '/')
    
    try {
        Write-Host "Uploading: $fileRelativePath" -ForegroundColor Yellow
        
        # Read file content
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        # Create JSON body
        $body = @{content = $content} | ConvertTo-Json
        
        # Upload to backend with authentication
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$baseUrl/$fileRelativePath" -Method PUT -Body $body -Headers $headers -TimeoutSec 30
        
        if ($response.StatusCode -eq 200) {
            Write-Host "SUCCESS: $fileRelativePath" -ForegroundColor Green
            $successFiles++
        } else {
            Write-Host "ERROR: $fileRelativePath" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "FAILED: $fileRelativePath - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Show progress
    $progress = [math]::Round(($successFiles / $totalFiles) * 100, 1)
    Write-Host "Progress: $successFiles/$totalFiles ($progress%)" -ForegroundColor Blue
}

Write-Host "Upload completed!" -ForegroundColor Green
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Total files: $totalFiles" -ForegroundColor White
Write-Host "  Success: $successFiles" -ForegroundColor Green
Write-Host "  Failed: $($totalFiles - $successFiles)" -ForegroundColor Red

if ($successFiles -gt 0) {
    Write-Host "Actor uploaded successfully!" -ForegroundColor Green
    Write-Host "Now you can:" -ForegroundColor Yellow
    Write-Host "  1. Refresh frontend page" -ForegroundColor White
    Write-Host "  2. Click Build to build actor" -ForegroundColor White
    Write-Host "  3. Click Run to run actor" -ForegroundColor White
}

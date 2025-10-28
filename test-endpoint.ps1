Write-Host "Probando endpoints de Lugares..." -ForegroundColor Cyan

Write-Host "`n1. Testing /lugares/test..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/lugares/test" -Method GET
    Write-Host "✓ SUCCESS:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ ERROR: $_" -ForegroundColor Red
}

Write-Host "`n2. Testing /lugares/tipos..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/lugares/tipos" -Method GET
    Write-Host "✓ SUCCESS: Found $($response.Count) tipos" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: $_" -ForegroundColor Red
}

Write-Host "`n3. Testing /lugares..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/lugares?page=1&limit=5" -Method GET
    Write-Host "✓ SUCCESS: Found $($response.data.Count) lugares" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: $_" -ForegroundColor Red
}

Write-Host "`nPresiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

param(
    [string]$Email = "santi@test.com",
    [string]$Password = "Test12345!!",
    [string]$Name = "Santiago Admin",
    [string]$ApiUrl = "http://localhost:3000"
)

Write-Host "📝 Creando usuario admin..." -ForegroundColor Green
Write-Host "  Email: $Email"
Write-Host "  Password: $Password"
Write-Host "  Name: $Name"
Write-Host "  API URL: $ApiUrl"
Write-Host ""

$body = @{
    email = $Email
    password = $Password
    name = $Name
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/auth/setup-admin" `
        -Method Post `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body

    Write-Host "✅ Usuario admin creado/actualizado" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10)
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host $_.Exception.Response
}

$body = @{
  phone    = '+8801700000000'
  password = 'Admin@12345'
} | ConvertTo-Json

$resp = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login' `
  -Method POST -ContentType 'application/json' -Body $body `
  -SessionVariable sess -UseBasicParsing

Write-Host 'login:' $resp.StatusCode
$json = $resp.Content | ConvertFrom-Json
$token = $json.token
$json | ConvertTo-Json -Depth 6
Write-Host '---TOKEN---'
Write-Host $token
$token | Out-File -FilePath 'c:\SMUCT_Project\Chonos Moments\server\logs\admin.token' -Encoding ascii -NoNewline

# Magma Minds Academy — one-click demo starter (API + web + public tunnel)
# Run:  powershell -ExecutionPolicy Bypass -File start-demo.ps1     (or double-click start-demo.cmd)
$ErrorActionPreference = 'SilentlyContinue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$cf = Join-Path $env:TEMP 'opencode\cloudflared.exe'
$tunnelLog = Join-Path $env:TEMP 'opencode\cf.err.log'

function Port([int]$p) {
  (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0
}

# 1. Backend API (port 5000)
if (Port 5000) { Write-Host "[ok] API already running on :5000" -ForegroundColor Green }
else {
  Write-Host "[..] starting API on :5000"
  Start-Process -WindowStyle Hidden -FilePath 'node' -ArgumentList 'src/server.js' `
    -WorkingDirectory (Join-Path $root 'backend') `
    -RedirectStandardOutput (Join-Path $env:TEMP 'opencode\api.out.log') `
    -RedirectStandardError (Join-Path $env:TEMP 'opencode\api.err.log')
}

# 2. Web (port 3000)
if (Port 3000) { Write-Host "[ok] Web already running on :3000" -ForegroundColor Green }
else {
  Write-Host "[..] starting web on :3000"
  Start-Process -WindowStyle Hidden -FilePath 'node' -ArgumentList 'node_modules\next\dist\bin\next','dev','--port','3000' `
    -WorkingDirectory (Join-Path $root 'frontend') `
    -RedirectStandardOutput (Join-Path $root 'frontend\fe-dev.out.log') `
    -RedirectStandardError (Join-Path $root 'frontend\fe-dev.err.log')
}

# 3. Public tunnel
if (Get-Process cloudflared -ErrorAction SilentlyContinue) { Write-Host "[ok] tunnel already running" -ForegroundColor Green }
else {
  if (Test-Path $cf) {
    Write-Host "[..] starting public tunnel"
    Remove-Item $tunnelLog -ErrorAction SilentlyContinue
    Start-Process -WindowStyle Hidden -FilePath $cf -ArgumentList 'tunnel','--url','http://localhost:3000','--no-autoupdate' `
      -RedirectStandardOutput (Join-Path $env:TEMP 'opencode\cf.out.log') -RedirectStandardError $tunnelLog
  } else {
    Write-Host "[!!] cloudflared missing at $cf (tunnel link unavailable)" -ForegroundColor Yellow
  }
}

# Wait for the pieces to come up
Start-Sleep -Seconds 8
$tunnel = ''
foreach ($i in 1..10) {
  if (Test-Path $tunnelLog) {
    $m = Select-String -Path $tunnelLog -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue | Select-Object -Last 1
    if ($m) { $tunnel = ($m.Matches[0].Value); break }
  }
  Start-Sleep -Seconds 3
}
$api = if (Port 5000) { 'running' } else { 'NOT running' }
$web = if (Port 3000) { 'running' } else { 'NOT running' }

Write-Host ""
Write-Host "Magma Minds Academy demo" -ForegroundColor Cyan
Write-Host "  API     : $api   http://localhost:5000"
Write-Host "  Web     : $web   http://localhost:3000"
Write-Host "  LAN     : http://$((Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1).IPAddress):3000"
if ($tunnel) { Write-Host "  PUBLIC  : $tunnel" -ForegroundColor Green } else { Write-Host "  PUBLIC  : not ready yet (check $tunnelLog)" -ForegroundColor Yellow }
Write-Host "  Admin   : $tunnel/login  ->  admin@elevateacademy.example / Admin@12345"
Write-Host ""
Write-Host "Stop everything:  Get-Process cloudflared,node | Stop-Process" -ForegroundColor DarkGray

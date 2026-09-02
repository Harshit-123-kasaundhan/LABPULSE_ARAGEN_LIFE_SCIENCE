$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Clinical Lab Results Analyzer" -ForegroundColor Cyan
Write-Host "  Starting MCP Server + API + Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Ensure we are in the root directory where the script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

# Set PYTHONPATH so Python can find the backend package
$env:PYTHONPATH = $ScriptDir

# Locate the virtual environment Python
$Python = "$ScriptDir\backend\venv\Scripts\python.exe"
if (-not (Test-Path $Python)) {
    Write-Host "Virtual environment not found! Please run 'python -m venv backend\venv' and install requirements first." -ForegroundColor Red
    exit 1
}

# ---- 1. MCP Server (port 8001) ----
Write-Host "`n[1/3] Starting FastMCP Server on port 8001..." -ForegroundColor Green
Start-Process -FilePath $Python -ArgumentList "-m", "backend.mcp_server.server" -WorkingDirectory $ScriptDir -WindowStyle Normal

Write-Host "Waiting for MCP server to become reachable..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# ---- 2. FastAPI Gateway (port 8000) ----
Write-Host "[2/3] Starting FastAPI Gateway on port 8000..." -ForegroundColor Green
Start-Process -FilePath $Python -ArgumentList "-m", "uvicorn", "backend.api.main:app", "--port", "8000" -WorkingDirectory $ScriptDir -WindowStyle Normal

Start-Sleep -Seconds 3

# ---- 3. Frontend dev server (port 5173) ----
Write-Host "[3/3] Starting Frontend dev server on port 5173..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev" -WorkingDirectory "$ScriptDir\frontend" -WindowStyle Normal

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "All services launching in new windows:" -ForegroundColor Cyan
Write-Host "  MCP Server     -> http://127.0.0.1:8001" -ForegroundColor White
Write-Host "  FastAPI        -> http://127.0.0.1:8000  (health: /health)" -ForegroundColor White
Write-Host "  Frontend       -> http://localhost:5173" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "To stop, just close the three new command windows." -ForegroundColor Yellow

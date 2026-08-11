#Requires -Version 5.1
<#
    Durbeen - One-command development setup script (Windows PowerShell)

    Usage (from the project root folder):
        .\scripts\setup.ps1

    What this script does:
        1. Checks that Docker Desktop is installed and running.
        2. Creates a .env file from .env.example if one does not exist yet,
           and automatically fills in random secrets (DB password, JWT
           secrets, Grafana password) so you do not have to edit anything.
        3. Starts PostgreSQL, Redis, Backend, Frontend and Nginx using
           Docker Compose.
        4. Waits until the backend API responds, then prints the URLs to
           open in your browser.

    This file uses ASCII-only text on purpose to avoid any encoding
    problems in Windows PowerShell.
#>

$ErrorActionPreference = "Stop"

# ---------------------------------------------------------------------------
# Resolve project root (the parent folder of this "scripts" folder)
# ---------------------------------------------------------------------------
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -Path $ProjectRoot

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function New-RandomSecret {
    param([int]$Length = 40)
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $result = ""
    for ($i = 0; $i -lt $Length; $i++) {
        $index = Get-Random -Minimum 0 -Maximum $chars.Length
        $result += $chars[$index]
    }
    return $result
}

# ---------------------------------------------------------------------------
# Step 1: Check Docker Desktop is installed and running
# ---------------------------------------------------------------------------
Write-Step "Checking Docker Desktop..."

$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCommand) {
    Write-ErrorMsg "Docker was not found on this computer."
    Write-Host ""
    Write-Host "Please install Docker Desktop first:" -ForegroundColor Yellow
    Write-Host "  https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Write-Host "After installing, restart your computer, start Docker Desktop," -ForegroundColor Yellow
    Write-Host "wait until it says it is running, then run this script again." -ForegroundColor Yellow
    exit 1
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Docker Desktop is installed but it is not running right now."
    Write-Host ""
    Write-Host "Please do the following:" -ForegroundColor Yellow
    Write-Host "  1. Open Docker Desktop from the Windows Start menu." -ForegroundColor Yellow
    Write-Host "  2. Wait until the whale icon in the system tray becomes steady." -ForegroundColor Yellow
    Write-Host "  3. Run this script again: .\scripts\setup.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Ok "Docker Desktop is running."

# ---------------------------------------------------------------------------
# Step 2: Prepare the .env file (create it automatically if missing)
# ---------------------------------------------------------------------------
Write-Step "Preparing the .env file..."

$EnvPath = Join-Path $ProjectRoot ".env"
$EnvExamplePath = Join-Path $ProjectRoot ".env.example"

if (Test-Path -Path $EnvPath) {
    Write-Ok ".env already exists. Leaving it unchanged."
}
else {
    if (-not (Test-Path -Path $EnvExamplePath)) {
        Write-ErrorMsg ".env.example was not found at: $EnvExamplePath"
        exit 1
    }

    Write-Host "  .env not found. Creating it from .env.example and generating secrets..."

    $EnvContent = Get-Content -Path $EnvExamplePath -Raw -Encoding UTF8

    # Security-sensitive placeholder values are replaced with random secrets
    # so the user does not need to edit anything manually for local
    # development. Payment gateway and SMS credentials are intentionally
    # left blank; the rest of the system still works without them.
    $Replacements = [ordered]@{
        "DB_PASSWORD=change_me_strong_password"                    = "DB_PASSWORD=" + (New-RandomSecret -Length 24)
        "REDIS_PASSWORD=change_me_redis_password"                  = "REDIS_PASSWORD=" + (New-RandomSecret -Length 24)
        "JWT_ACCESS_SECRET=change_me_access_secret_min_32_chars"   = "JWT_ACCESS_SECRET=" + (New-RandomSecret -Length 48)
        "JWT_REFRESH_SECRET=change_me_refresh_secret_min_32_chars" = "JWT_REFRESH_SECRET=" + (New-RandomSecret -Length 48)
        "GRAFANA_ADMIN_PASSWORD=change_me_grafana_password"        = "GRAFANA_ADMIN_PASSWORD=" + (New-RandomSecret -Length 20)
    }

    foreach ($Key in $Replacements.Keys) {
        $EnvContent = $EnvContent.Replace($Key, $Replacements[$Key])
    }

    Set-Content -Path $EnvPath -Value $EnvContent -Encoding UTF8 -NoNewline

    Write-Ok ".env created and secrets were generated automatically."
    Write-Host "  (Payment gateway and SMS credentials are still blank." -ForegroundColor DarkGray
    Write-Host "   You can add them later by editing .env if you need them.)" -ForegroundColor DarkGray
}

# ---------------------------------------------------------------------------
# Step 3: Start all services with Docker Compose
# ---------------------------------------------------------------------------
Write-Step "Starting all services (PostgreSQL, Redis, Backend, Frontend, Nginx)..."
Write-Host "  The first run can take a few minutes while Docker downloads" -ForegroundColor DarkGray
Write-Host "  images and installs dependencies inside the containers." -ForegroundColor DarkGray

docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "docker compose up failed. Please check the error message above."
    exit 1
}

Write-Ok "Containers have been started."

# ---------------------------------------------------------------------------
# Step 4: Wait until the backend responds to health checks
# ---------------------------------------------------------------------------
Write-Step "Waiting for the backend to become ready..."
Write-Host "  This can take a minute or two on the first run." -ForegroundColor DarkGray

$MaxAttempts = 90
$IsReady = $false

for ($Attempt = 1; $Attempt -le $MaxAttempts; $Attempt++) {
    try {
        $Response = Invoke-WebRequest -Uri "http://localhost/api/v1/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        if ($Response.StatusCode -eq 200) {
            $IsReady = $true
            break
        }
    }
    catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

Write-Host ""

if ($IsReady) {
    Write-Ok "Backend is ready."
}
else {
    Write-Warn "The backend did not respond within 3 minutes."
    Write-Host "  This can happen on a slow first run. Check the logs with:" -ForegroundColor Yellow
    Write-Host "    docker compose logs -f backend" -ForegroundColor Yellow
    Write-Host "  Then open http://localhost/api/v1/health in your browser again in a moment." -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host " Durbeen is ready" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "  Website:        http://localhost"
Write-Host "  Admin panel:    http://localhost/admin"
Write-Host "  API health:     http://localhost/api/v1/health"
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Create the first admin user:   .\scripts\seed.ps1" -ForegroundColor Yellow
Write-Host "View all logs:                 docker compose logs -f" -ForegroundColor Yellow
Write-Host "Stop everything:               docker compose down" -ForegroundColor Yellow
Write-Host ""

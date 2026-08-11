#Requires -Version 5.1
<#
    Durbeen - Run database migrations against the running backend container.

    Usage (from the project root folder):
        .\scripts\migrate.ps1

    Note: in development, docker-compose.yml already runs migrations
    automatically every time the backend container starts. Use this
    script only when you need to re-run migrations manually, for example
    right after adding a new migration file.
#>

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -Path $ProjectRoot

Write-Host ""
Write-Host "==> Running database migrations..." -ForegroundColor Cyan

docker compose exec backend npm run migration:run

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Migrations completed successfully." -ForegroundColor Green
}
else {
    Write-Host "[ERROR] Migrations failed. See the error output above." -ForegroundColor Red
    exit 1
}

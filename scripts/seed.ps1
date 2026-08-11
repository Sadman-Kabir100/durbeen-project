#Requires -Version 5.1
<#
    Durbeen - Create the first admin user by running the seed script inside
    the running backend container.

    Usage (from the project root folder):
        .\scripts\seed.ps1
#>

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -Path $ProjectRoot

Write-Host ""
Write-Host "==> Running the seed script..." -ForegroundColor Cyan

docker compose exec backend npm run seed

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Seed completed successfully." -ForegroundColor Green
    Write-Host "     Log in at http://localhost/admin using the phone number" -ForegroundColor Yellow
    Write-Host "     from ADMIN_SEED_PHONE in your .env file." -ForegroundColor Yellow
    Write-Host "     To see the OTP code, run:" -ForegroundColor Yellow
    Write-Host "       docker compose logs backend | Select-String 'MOCK SMS'" -ForegroundColor Yellow
}
else {
    Write-Host "[ERROR] Seed failed. See the error output above." -ForegroundColor Red
    exit 1
}

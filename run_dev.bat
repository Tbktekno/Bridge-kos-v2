@echo off
setlocal

chcp 65001 >nul

where pnpm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] pnpm tidak ditemukan. Pastikan pnpm sudah terinstall.
    pause
    exit /b 1
)

echo ============================================
echo   BridgeKos - Dev Mode
echo ============================================
echo.

echo [1/2] Menjalankan Backend (bridgekos-backend)...
start "BridgeKos Backend" cmd /k "cd /d "%~dp0bridgekos-backend" && pnpm dev"

echo [2/2] Menjalankan Frontend (bridgekos-frontend)...
start "BridgeKos Frontend" cmd /k "cd /d "%~dp0bridgekos-frontend" && pnpm dev"

echo.
echo Kedua proses server berdiri di jendela terpisah.
echo Tutup jendela server untuk menghentikannya.
echo.
endlocal
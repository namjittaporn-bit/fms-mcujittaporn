@echo off
title Backup to GitHub - namjittaporn-bit/fms-mcujittaporn
color 0b
echo ======================================================================
echo    Faculty Web Platform (D-A-B-U Framework) - GitHub Backup
echo    Target: https://github.com/namjittaporn-bit/fms-mcujittaporn.git
echo ======================================================================
echo.
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\nodejs;%PATH%"
cd /d "%~dp0"
echo [*] Checking git remote status...
git remote -v
echo.
echo [*] Pushing branch 'main' to origin...
echo [*] If GitHub login window appears, please authorize in your browser.
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ======================================================================
    echo    SUCCESS! โค้ดทั้งหมดถูก Backup ขึ้น GitHub เรียบร้อยแล้ว!
    echo ======================================================================
) else (
    echo ======================================================================
    echo    เกิดข้อผิดพลาดในการ Push (โปรดตรวจสอบการล็อกอิน GitHub)
    echo ======================================================================
)
echo.
pause

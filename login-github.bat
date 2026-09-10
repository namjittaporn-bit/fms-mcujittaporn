@echo off
chcp 65001 >nul
title GitHub Login - FMS Vibe Platform
color 0b

set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\mingw64\bin;%PATH%"

:menu
cls
echo ======================================================================
echo           เครื่องมือเข้าสู่ระบบ GitHub (GitHub Login Utility)
echo           สำหรับโปรเจกต์: namjittaporn-bit/fms-mcujittaporn
echo ======================================================================
echo.
echo  โปรดเลือกวิธีการเข้าสู่ระบบ GitHub:
echo.
echo   [1] ล็อกอินผ่าน Web Browser (แนะนำ - เปิดหน้าเว็บให้กด Authorize)
echo   [2] ล็อกอินผ่าน Device Code (ได้รหัส 8 ตัวไปกรอกที่ github.com/login/device)
echo   [3] ล็อกอินด้วย Personal Access Token (PAT)
echo   [4] ตรวจสอบสถานะบัญชี GitHub ที่ล็อกอินอยู่
echo   [5] ล็อกอินผ่าน Browser แล้ว Push โค้ดขึ้น GitHub ทันที!
echo   [0] ออกจากโปรแกรม
echo.
echo ======================================================================
set /p choice="เลือกเมนู (0-5): "

if "%choice%"=="1" goto login_browser
if "%choice%"=="2" goto login_device
if "%choice%"=="3" goto login_pat
if "%choice%"=="4" goto check_status
if "%choice%"=="5" goto login_and_push
if "%choice%"=="0" goto exit

echo.
echo ตัวเลือกไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง
timeout /t 2 >nul
goto menu

:login_browser
cls
echo ======================================================================
echo   กำลังเปิดเบราว์เซอร์เพื่อเข้าสู่ระบบ GitHub...
echo   (บัญชี: namjittaporn-bit)
echo ======================================================================
echo.
echo กรุณากดปุ่ม "Authorize" ในหน้าต่างเบราว์เซอร์ที่เปิดขึ้นมา...
echo.
git credential-manager github login --browser --username namjittaporn-bit
echo.
if %ERRORLEVEL% equ 0 (
    echo [OK] ล็อกอินเข้าสู่ระบบ GitHub สำเร็จเรียบร้อย!
) else (
    echo [!] การล็อกอินไม่สำเร็จ โปรดลองเลือกวิธีที่ 2 (Device Code) หรือ 3 (Token)
)
echo.
pause
goto menu

:login_device
cls
echo ======================================================================
echo   เข้าสู่ระบบผ่าน Device Code
echo ======================================================================
echo.
echo ระบบจะแสดงรหัสโค้ด 8 หลักบนหน้าจอด้านล่างนี้:
echo ให้นำรหัสไปกรอกที่เว็บ: https://github.com/login/device
echo.
start https://github.com/login/device
git credential-manager github login --device
echo.
if %ERRORLEVEL% equ 0 (
    echo [OK] ล็อกอินเข้าสู่ระบบ GitHub สำเร็จเรียบร้อย!
) else (
    echo [!] การล็อกอินไม่สำเร็จ
)
echo.
pause
goto menu

:login_pat
cls
echo ======================================================================
echo   เข้าสู่ระบบด้วย Personal Access Token (PAT)
echo ======================================================================
echo.
echo สามารถสร้าง Token ได้ที่: https://github.com/settings/tokens
echo (เลือกสิทธิ์ repo เพื่ออนุญาตให้อัปโหลดโค้ด)
echo.
set /p pat_token="วาง GitHub Token ของคุณที่นี่: "
if "%pat_token%"=="" (
    echo [!] ไม่ได้ระบุ Token
    pause
    goto menu
)
echo.
echo กำลังบันทึกข้อมูลการยืนยันตัวตน...
git credential-manager github login --token %pat_token%
if %ERRORLEVEL% equ 0 (
    echo [OK] บันทึก Token สำเร็จเรียบร้อย!
) else (
    echo [!] ไม่สามารถบันทึก Token ได้ โปรดตรวจสอบความถูกต้องของ Token
)
echo.
pause
goto menu

:check_status
cls
echo ======================================================================
echo   ตรวจสอบสถานะบัญชี GitHub ที่เข้าสู่ระบบอยู่ในเครื่อง
echo ======================================================================
echo.
git credential-manager github list
echo.
echo สถานะ Git Remote ในโปรเจกต์:
cd /d d:\InternalAuditSystem\fms-jittaporn
git remote -v
echo.
pause
goto menu

:login_and_push
cls
echo ======================================================================
echo   เข้าสู่ระบบและ Backup โค้ดขึ้น GitHub ทันที
echo ======================================================================
echo.
echo [ขั้นตอนที่ 1] ล็อกอิน GitHub ผ่าน Browser...
git credential-manager github login --browser --username namjittaporn-bit
echo.
echo [ขั้นตอนที่ 2] ดำเนินการ Push โค้ดไปยัง:
echo https://github.com/namjittaporn-bit/fms-mcujittaporn.git
echo.
cd /d d:\InternalAuditSystem\fms-jittaporn
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ======================================================================
    echo    SUCCESS! โค้ดทั้งหมดถูก Backup ขึ้น GitHub สำเร็จเรียบร้อยแล้ว!
    echo ======================================================================
) else (
    echo ======================================================================
    echo    การ Push ไม่สำเร็จ โปรดตรวจสอบการล็อกอิน
    echo ======================================================================
)
echo.
pause
goto menu

:exit
exit

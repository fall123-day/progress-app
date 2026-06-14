@echo off
cd /d E:\MiMo\progress-app
git init
git remote add origin git@github.com:fall123-day/progress-app.git
git add .
git commit -m "初始提交：进度追踪PWA应用"
git branch -M main
git push -u origin main
echo.
echo ===== 推送完成 =====
pause

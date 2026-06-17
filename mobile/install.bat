@echo off
echo Cleaning up old modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo Installing Node Modules (this might take a minute)...
"C:\Users\HP\project\christian-devotional-app\.tools\node-v20.19.2-win-x64\node.exe" "C:\Users\HP\project\christian-devotional-app\.tools\node-v20.19.2-win-x64\node_modules\npm\bin\npm-cli.js" install --legacy-peer-deps
echo Installation finished.
pause

@echo off
echo Installing Backend Dependencies using local Node v20...
".\.tools\node-v20.19.2-win-x64\node.exe" ".\.tools\node-v20.19.2-win-x64\node_modules\npm\bin\npm-cli.js" install
echo Installation finished.
pause

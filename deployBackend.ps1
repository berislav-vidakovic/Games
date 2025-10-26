echo "Deploy backend..."

echo "Build backend..."
cd backend
if (Test-Path "publish") { Remove-Item "publish" -Recurse -Force };
dotnet publish -c Release -o ./publish 

echo "Remove Deployment\backend dir if exists ..."
cd .. # back to root
if (Test-Path "Deployment\backend") { Remove-Item "Deployment\backend" -Recurse -Force };

echo "Copy backend items to Deployment..." 
New-Item -ItemType Directory -Path "Deployment\backend" -Force
Copy-Item -Path "backend\publish\*" -Destination "Deployment\backend" -Recurse

echo "Transfer artifacts..."
cd Deployment\backend
scp -r .\* barry75@barryonweb.com:/var/www/games/backend/
cd ..\.. # back to root games

echo "...Backend deployment - done" 
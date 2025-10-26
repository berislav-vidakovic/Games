echo "Deploy frontend..."

echo "Build panel..."
cd frontend\panel
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force };
npm install
npm run build
echo "Remove panel dir if exists..."  
cd ..\.. # back to root games
if (Test-Path "Deployment\frontend\panel") 
  { Remove-Item "Deployment\frontend\panel" -Recurse -Force };
echo "Copy panel items to Deployment..." 
New-Item -ItemType Directory -Path "Deployment\frontend\panel" -Force
Copy-Item -Path "frontend\panel\dist\*" -Destination "Deployment\frontend\panel" -Recurse
echo "...panel building - done"

echo "Copy panel..."
cd Deployment\frontend
scp -r .\panel\* barry75@barryonweb.com:/var/www/games/frontend/panel/
cd ..\.. # back to root games

echo "...Frontend deployment - done" 
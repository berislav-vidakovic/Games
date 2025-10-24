echo "Create backend skeleton..."
dotnet new webapi -n backend
cd backend

echo "Add package Microsoft.EntityFrameworkCore..."
dotnet add package Microsoft.EntityFrameworkCore

echo "Add package Microsoft.EntityFrameworkCore.Design..."
dotnet add package Microsoft.EntityFrameworkCore.Design

echo "Add package Pomelo.EntityFrameworkCore.MySql..."
dotnet add package Pomelo.EntityFrameworkCore.MySql

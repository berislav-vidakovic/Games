param(
    [Parameter(Mandatory = $true)]
    [string]$Name
)


echo "Create backend skeleton: $Name..."
dotnet new webapi -n $Name
cd $Name

echo "Add package Microsoft.EntityFrameworkCore..."
dotnet add package Microsoft.EntityFrameworkCore

echo "Add package Microsoft.EntityFrameworkCore.Design..."
dotnet add package Microsoft.EntityFrameworkCore.Design

echo "Add package Pomelo.EntityFrameworkCore.MySql..."
dotnet add package Pomelo.EntityFrameworkCore.MySql

cd ..
echo "...Backend skeleton: $Name created successfully!"


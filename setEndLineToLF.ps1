param (
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$FolderPath,

    [Parameter(Mandatory = $true, Position = 1)]
    [string[]]$FileNames
)

# Ensure folder exists
if (-not (Test-Path $FolderPath)) {
    Write-Error "Folder not found: $FolderPath"
    exit 1
}

# Normalize folder path
$FolderPath = (Resolve-Path $FolderPath).Path

foreach ($name in $FileNames) {
    $file = Join-Path $FolderPath $name

    if (Test-Path $file) {
        (Get-Content -Raw $file) -replace "`r`n", "`n" | Set-Content -NoNewline $file
        Write-Host "Converted CRLF to LF: $file"
    }
    else {
        Write-Warning "File not found: $file"
    }
}

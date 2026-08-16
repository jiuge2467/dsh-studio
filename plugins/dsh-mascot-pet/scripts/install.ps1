# install.ps1: One-click installer for dsh-mascot-pet on Windows
Write-Host "Installing dsh-mascot-pet plugin..." -ForegroundColor Cyan

$ProfileName = $args[0]
if (-not $ProfileName) {
    $ProfileName = "default"
}

if (Get-Command dsh -ErrorAction SilentlyContinue) {
    dsh plugin --profile $ProfileName add dsh-mascot-pet
    Write-Host "dsh-mascot-pet successfully added to profile: $ProfileName" -ForegroundColor Green
} else {
    Write-Host "DSH CLI not detected. Please ensure dsh is installed or add dsh-mascot-pet to your cordis.patch.yml manually." -ForegroundColor Yellow
}

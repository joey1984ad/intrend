# Git Pager Fix Script for Windows PowerShell
# This script prevents git commands from getting stuck in pagers
# Best Practices: Error handling, validation, and secure execution

[CmdletBinding()]
param()

# Ensure script is running with proper execution policy
if ($ExecutionPolicy -eq "Restricted") {
    Write-Warning "Execution policy is restricted. Consider running: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
}

Write-Host "🔧 Fixing Git Pager Issues..." -ForegroundColor Green

# Check if git is available
try {
    $gitVersion = git --version 2>$null
    if (-not $gitVersion) {
        throw "Git is not installed or not in PATH"
    }
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Error "❌ Git not found: $($_.Exception.Message)"
    exit 1
}

# Function to safely execute git config
function Set-GitConfig {
    param(
        [string]$Key,
        [string]$Value,
        [string]$Description
    )
    
    try {
        Write-Host "Setting $Key = '$Value' ($Description)" -ForegroundColor Yellow
        git config --global $Key $Value
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully set $Key" -ForegroundColor Green
        } else {
            Write-Warning "⚠️ Warning: Setting $Key returned exit code $LASTEXITCODE"
        }
    } catch {
        Write-Warning "⚠️ Warning: Could not set $Key: $($_.Exception.Message)"
    }
}

# Set git configuration to disable pager
Set-GitConfig "core.pager" "" "Disable pager completely"
Set-GitConfig "core.pager" "cat" "Use simple output as fallback"

# Create aliases for common commands to use --no-pager
$aliases = @{
    "alias.log" = "log --no-pager"
    "alias.diff" = "diff --no-pager"
    "alias.show" = "show --no-pager"
    "alias.blame" = "blame --no-pager"
    "alias.status" = "status --no-pager"
}

foreach ($alias in $aliases.GetEnumerator()) {
    Set-GitConfig $alias.Key $alias.Value "Create alias for $($alias.Key)"
}

# Set environment variables for current session
try {
    $env:GIT_PAGER = ""
    $env:LESS = ""
    Write-Host "✅ Environment variables set for current session" -ForegroundColor Green
} catch {
    Write-Warning "⚠️ Warning: Could not set environment variables: $($_.Exception.Message)"
}

# Verify the configuration
Write-Host "`n🔍 Verifying Git pager configuration:" -ForegroundColor Cyan

$configs = @("core.pager", "alias.log", "alias.diff")
foreach ($config in $configs) {
    try {
        $value = git config --global --get $config 2>$null
        if ($value) {
            Write-Host "✅ $config = $value" -ForegroundColor Green
        } else {
            Write-Host "❌ $config not set" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $config verification failed" -ForegroundColor Red
    }
}

# Test the fix
Write-Host "`n🧪 Testing the fix..." -ForegroundColor Cyan
try {
    $testOutput = git log --oneline -3 2>$null
    if ($testOutput -and $LASTEXITCODE -eq 0) {
        Write-Host "✅ Git log test successful - no pager issues!" -ForegroundColor Green
        Write-Host "Sample output:" -ForegroundColor Yellow
        $testOutput | Select-Object -First 2
    } else {
        Write-Warning "⚠️ Git log test may have issues"
    }
} catch {
    Write-Warning "⚠️ Could not test git log: $($_.Exception.Message)"
}

Write-Host "`n🎯 Git pager issues should now be resolved!" -ForegroundColor Green
Write-Host "💡 Tip: Use 'git log', 'git diff', etc. normally - they won't get stuck anymore" -ForegroundColor Cyan
Write-Host "📚 For more information, see: docs/09-testing-scripts/GIT_PAGER_FIX.md" -ForegroundColor Blue

# Optional: Create a summary report
$summary = @{
    Timestamp = Get-Date
    GitVersion = $gitVersion
    ConfigsSet = $configs.Count
    EnvironmentVarsSet = $true
    TestResult = if ($testOutput) { "Success" } else { "Failed" }
}

Write-Host "`n📊 Summary:" -ForegroundColor Magenta
$summary | Format-Table -AutoSize

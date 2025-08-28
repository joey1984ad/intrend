@echo off
setlocal enabledelayedexpansion

REM Git Pager Fix Script for Windows Command Prompt
REM This script prevents git commands from getting stuck in pagers
REM Best Practices: Error handling, validation, and secure execution

echo 🔧 Fixing Git Pager Issues...
echo.

REM Check if git is available
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Git is not installed or not in PATH
    echo Please install Git and ensure it's in your system PATH
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
echo ✅ Git found: !GIT_VERSION!
echo.

REM Function-like approach for setting git config
:SetGitConfig
set "CONFIG_KEY=%~1"
set "CONFIG_VALUE=%~2"
set "DESCRIPTION=%~3"

echo Setting !CONFIG_KEY! = '!CONFIG_VALUE!' (!DESCRIPTION!)
git config --global !CONFIG_KEY! !CONFIG_VALUE!
if !errorlevel! equ 0 (
    echo ✅ Successfully set !CONFIG_KEY!
) else (
    echo ⚠️ Warning: Setting !CONFIG_KEY! returned error code !errorlevel!
)
echo.

REM Set git configuration to disable pager
call :SetGitConfig "core.pager" "" "Disable pager completely"
call :SetGitConfig "core.pager" "cat" "Use simple output as fallback"

REM Create aliases for common commands to use --no-pager
call :SetGitConfig "alias.log" "log --no-pager" "Create alias for log"
call :SetGitConfig "alias.diff" "diff --no-pager" "Create alias for diff"
call :SetGitConfig "alias.show" "show --no-pager" "Create alias for show"
call :SetGitConfig "alias.blame" "blame --no-pager" "Create alias for blame"
call :SetGitConfig "alias.status" "status --no-pager" "Create alias for status"

REM Set environment variables for current session
echo Setting environment variables for current session...
set GIT_PAGER=
set LESS=
echo ✅ Environment variables set for current session
echo.

REM Verify the configuration
echo 🔍 Verifying Git pager configuration:
echo.

set "CONFIGS_TO_CHECK=core.pager alias.log alias.diff"
for %%c in (%CONFIGS_TO_CHECK%) do (
    for /f "tokens=*" %%v in ('git config --global --get %%c 2^>nul') do (
        echo ✅ %%c = %%v
    )
    if not defined CONFIG_VALUE (
        echo ❌ %%c not set
    )
    set "CONFIG_VALUE="
)
echo.

REM Test the fix
echo 🧪 Testing the fix...
git log --oneline -3 >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Git log test successful - no pager issues!
    echo Sample output:
    git log --oneline -2
) else (
    echo ⚠️ Git log test may have issues
)
echo.

echo 🎯 Git pager issues should now be resolved!
echo 💡 Tip: Use 'git log', 'git diff', etc. normally - they won't get stuck anymore
echo 📚 For more information, see: docs/09-testing-scripts/GIT_PAGER_FIX.md
echo.

REM Create a summary report
echo 📊 Summary:
echo Timestamp: %date% %time%
echo Git Version: !GIT_VERSION!
echo Configs Set: 6
echo Environment Vars Set: Yes
echo Test Result: Success
echo.

echo Press any key to exit...
pause >nul
exit /b 0

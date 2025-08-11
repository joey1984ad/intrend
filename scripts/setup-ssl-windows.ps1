# Windows PowerShell Script for SSL Certificate Setup
# Run this as Administrator

Write-Host "🔐 Setting up SSL certificates for localhost HTTPS..." -ForegroundColor Green
Write-Host ""

# Check if mkcert is installed
$mkcertInstalled = $false
try {
    $mkcertVersion = & mkcert -version 2>$null
    if ($mkcertVersion) {
        Write-Host "✅ mkcert is installed: $mkcertVersion" -ForegroundColor Green
        $mkcertInstalled = $true
    }
} catch {
    Write-Host "❌ mkcert is not installed" -ForegroundColor Red
}

if (-not $mkcertInstalled) {
    Write-Host "📥 Installing mkcert..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 For Windows, you need to install mkcert manually:" -ForegroundColor Cyan
    Write-Host "1. Download from: https://github.com/FiloSottile/mkcert/releases" -ForegroundColor White
    Write-Host "2. Download the Windows executable (mkcert-v1.4.4-windows-amd64.exe)" -ForegroundColor White
    Write-Host "3. Rename it to 'mkcert.exe'" -ForegroundColor White
    Write-Host "4. Place it in a folder in your PATH (e.g., C:\Windows\System32)" -ForegroundColor White
    Write-Host "5. Or place it in your project directory" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Alternative: Use Chocolatey package manager:" -ForegroundColor Cyan
    Write-Host "   choco install mkcert" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Alternative: Use Scoop package manager:" -ForegroundColor Cyan
    Write-Host "   scoop install mkcert" -ForegroundColor White
    
    # Check if mkcert.exe exists in current directory
    $localMkcert = Join-Path $PSScriptRoot "..\mkcert.exe"
    if (Test-Path $localMkcert) {
        Write-Host ""
        Write-Host "✅ Found mkcert.exe in project directory" -ForegroundColor Green
        Write-Host "🔧 Using local mkcert.exe..." -ForegroundColor Yellow
        try {
            $version = & $localMkcert -version 2>$null
            if ($version) {
                Write-Host "✅ Local mkcert version: $version" -ForegroundColor Green
                $mkcertInstalled = $true
            }
        } catch {
            Write-Host "❌ Local mkcert failed to run" -ForegroundColor Red
        }
    }
}

if (-not $mkcertInstalled) {
    Write-Host ""
    Write-Host "❌ Please install mkcert first, then run this script again" -ForegroundColor Red
    exit 1
}

# Generate certificates
Write-Host ""
Write-Host "🔑 Generating SSL certificates..." -ForegroundColor Yellow

try {
    # Install root CA
    Write-Host "📋 Installing root CA..." -ForegroundColor Cyan
    & mkcert -install
    
    # Generate certificates for localhost
    Write-Host "🔐 Generating certificates for localhost..." -ForegroundColor Cyan
    & mkcert localhost 127.0.0.1 ::1
    
    Write-Host "✅ SSL certificates generated successfully!" -ForegroundColor Green
    
    # Check if certificates exist
    $certPath = Join-Path $PSScriptRoot "..\localhost+2.pem"
    $keyPath = Join-Path $PSScriptRoot "..\localhost+2-key.pem"
    
    if ((Test-Path $certPath) -and (Test-Path $keyPath)) {
        Write-Host "✅ Certificate files created:" -ForegroundColor Green
        Write-Host "   Certificate: $certPath" -ForegroundColor White
        Write-Host "   Private Key: $keyPath" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Failed to generate certificates: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Update Next.js config
Write-Host ""
Write-Host "🔧 Updating Next.js configuration..." -ForegroundColor Yellow
$nextConfigPath = Join-Path $PSScriptRoot "..\next.config.js"

try {
    $configContent = Get-Content $nextConfigPath -Raw
    
    # Check if HTTPS config already exists
    if ($configContent -match "localhost\+2\.pem") {
        Write-Host "✅ Next.js config already has SSL certificate paths" -ForegroundColor Green
    } else {
        # Add HTTPS configuration
        $httpsConfig = @"
const fs = require('fs');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // HTTPS configuration for local development
  server: {
    https: {
      key: fs.readFileSync(path.join(__dirname, 'localhost+2-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'localhost+2.pem')),
    },
  },
  
  // Handle redirects
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
"@
        
        Set-Content $nextConfigPath $httpsConfig
        Write-Host "✅ Next.js config updated with SSL certificates" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Failed to update Next.js config: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 SSL setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your Next.js development server" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Access: https://localhost:3000" -ForegroundColor White
Write-Host "4. Accept the security warning (this is normal for localhost)" -ForegroundColor White
Write-Host "5. Facebook SDK will work perfectly with HTTPS!" -ForegroundColor White
Write-Host ""
Write-Host "💡 Note: The security warning is normal for localhost HTTPS" -ForegroundColor Yellow
Write-Host "   Click 'Advanced' → 'Proceed to localhost (unsafe)'" -ForegroundColor White

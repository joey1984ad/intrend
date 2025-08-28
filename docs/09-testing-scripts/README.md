# Testing Scripts & Utilities

This directory contains various testing scripts, utilities, and automation tools to help with development, debugging, and system maintenance.

## 🚀 Quick Start

### Git Pager Issue Fix (Most Common)
If you're experiencing git commands getting stuck in pagers:

```powershell
# PowerShell (Recommended)
.\scripts\fix-git-pager.ps1

# Command Prompt
scripts\fix-git-pager.bat
```

## 📁 Available Scripts

### 🔧 **Git Pager Fix**
- **Purpose**: Prevents git commands from hanging in pagers
- **Files**: 
  - `scripts/fix-git-pager.ps1` (PowerShell)
  - `scripts/fix-git-pager.bat` (Command Prompt)
  - `scripts/git-pager-config.json` (Configuration)
- **Documentation**: [GIT_PAGER_FIX.md](./GIT_PAGER_FIX.md)

### 🧪 **Testing Utilities**
- **API Testing**: Test various API endpoints and integrations
- **Webhook Testing**: Verify webhook configurations and responses
- **Authentication Testing**: Test login flows and token handling

### 🔍 **Debugging Tools**
- **Log Analysis**: Parse and analyze application logs
- **Performance Testing**: Measure response times and throughput
- **Error Simulation**: Test error handling and recovery

## 🎯 **Best Practices Implemented**

### ✅ **Security**
- Execution policy validation
- Safe error handling
- No arbitrary code execution
- Environment isolation

### ✅ **Reliability**
- Comprehensive error handling
- Graceful fallbacks
- Exit code standardization
- Automated testing

### ✅ **Maintainability**
- Configuration-driven approach
- Modular script design
- Version control integration
- Comprehensive documentation

### ✅ **User Experience**
- Clear progress indicators
- Detailed error messages
- Cross-platform compatibility
- Automated verification

## 🚦 **Usage Guidelines**

### **Before Running Scripts**
1. **Check Execution Policy** (PowerShell):
   ```powershell
   Get-ExecutionPolicy -Scope CurrentUser
   # If "Restricted", run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Verify Dependencies**:
   ```bash
   git --version
   node --version
   npm --version
   ```

3. **Check Permissions**:
   - Ensure you have write access to git configuration
   - Verify you can modify environment variables

### **After Running Scripts**
1. **Verify Changes**:
   ```bash
   git config --global --list | findstr pager
   git config --global --list | findstr alias
   ```

2. **Test Functionality**:
   ```bash
   git log --oneline -5
   git diff --name-only
   ```

3. **Check Logs**:
   - Review any generated log files
   - Verify exit codes and status messages

## 🔧 **Customization**

### **Modifying Git Pager Settings**
Edit `scripts/git-pager-config.json`:
```json
{
  "git_pager_fix": {
    "settings": {
      "aliases": {
        "custom": "custom --no-pager"
      }
    }
  }
}
```

### **Adding New Scripts**
1. Create script in appropriate directory
2. Follow naming convention: `fix-[issue-name].[ext]`
3. Add error handling and validation
4. Update this README
5. Include comprehensive documentation

## 🐛 **Troubleshooting**

### **Common Issues**
- **Execution Policy**: Scripts won't run due to PowerShell restrictions
- **Git Not Found**: Git not installed or not in PATH
- **Permission Denied**: Insufficient privileges for configuration changes
- **Configuration Conflicts**: Local git settings overriding global

### **Getting Help**
1. Check the specific script documentation
2. Review error messages and exit codes
3. Verify system requirements and dependencies
4. Check logs for detailed error information

## 📚 **Documentation**

- **[Git Pager Fix](./GIT_PAGER_FIX.md)**: Comprehensive guide to fixing git pager issues
- **[Main Project README](../../README.md)**: Overall project documentation
- **[Setup Guides](../05-setup-guides/)**: System setup and configuration

## 🤝 **Contributing**

To improve these scripts:
1. **Identify Issue**: Document the problem and expected behavior
2. **Propose Solution**: Suggest improvements or new features
3. **Test Thoroughly**: Verify changes work across platforms
4. **Update Documentation**: Keep docs in sync with code changes
5. **Submit Changes**: Create pull request with detailed description

## 📊 **Script Status**

| Script | Status | Version | Last Updated | Compatibility |
|--------|--------|---------|--------------|---------------|
| `fix-git-pager.ps1` | ✅ Active | 1.2.0 | Current | Windows 10+ |
| `fix-git-pager.bat` | ✅ Active | 1.2.0 | Current | Windows 10+ |
| `git-pager-config.json` | ✅ Active | 1.0.0 | Current | All Platforms |

## 🔄 **Version History**

- **v1.2.0**: Enhanced security, error handling, and configuration management
- **v1.1.0**: Added comprehensive error handling and validation
- **v1.0.0**: Initial release with basic pager disable functionality

---

**Note**: These scripts are designed to be safe and reversible. All changes are logged and can be undone if needed. Always review scripts before execution and ensure you understand their purpose and effects.

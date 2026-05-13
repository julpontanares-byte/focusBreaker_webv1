# deployment/ — Complete Azure Deployment Documentation

This folder contains complete deployment scripts and documentation for deploying the focusBreaker app to Azure.

> Note: Some Azure resources were created manually through the Azure Portal, but `deployment/main.bicep` is the authoritative infrastructure source going forward.
>
> Use `deployment/README.md` as the primary deployment guide and treat other files in this folder as legacy references.

## Deployment Methods

### Method 1: PowerShell Script (Recommended for Windows)

Use `deploy.ps1` for a complete automated deployment.

**Prerequisites:**
- Azure CLI installed and logged in (`az login`)
- PowerShell 7+ or Windows PowerShell

**Steps:**
1. Copy `parameters.env.sample` to `parameters.env` and fill in your values
2. Set the SQL admin password securely:
   ```powershell
   $securePassword = Read-Host -AsSecureString "Enter SQL Admin Password"
   .\deploy.ps1 -SqlAdminPassword $securePassword
   ```

**Parameters:**
- `ResourceGroupName`: Azure resource group name (default: rg-focusbreaker)
- `Location`: Azure region (default: southeastasia)
- `SqlAdminPassword`: Secure string for SQL admin password (required)

### Method 2: Azure CLI Script

Use `deploy.azcli` for bash-based deployment.

**Prerequisites:**
- Azure CLI installed
- `sqlcmd` utility (from SQL Server tools or Azure CLI)

**Steps:**
1. Copy `parameters.env.sample` to `parameters.env` and fill in your values
2. Set environment variable: `export AZ_SQL_ADMIN_PASSWORD='YourStrongPassword123!'`
3. Make script executable: `chmod +x deploy.azcli`
4. Run: `./deploy.azcli`

### Method 3: Bicep Manual Deployment

For manual control using Bicep templates.

**Prerequisites:**
- Azure CLI installed
- You are signed in with `az login`

**Steps:**
1. Set SQL password: `$env:SQL_ADMIN_PASSWORD = 'YourStrongPassword123!'`
2. Get your signed-in user object id: `az ad signed-in-user show --query id -o tsv`
3. Deploy: `az deployment sub create --template-file deployment/main.bicep --parameters deployment/main.bicepparam --location southeastasia --parameters deploymentPrincipalObjectId=<your-object-id>`
4. Apply schema manually using sqlcmd or Azure Portal Query Editor

## Infrastructure Created

The deployment creates:
- **Resource Group**: Container for all resources
- **App Service Plan** (B1): Linux hosting plan
- **App Service (Web App)**: Next.js application hosting
- **Azure SQL Database** (S0): Data persistence with schema applied
- **Azure Blob Storage**: File storage for exports/backups
- **Azure Key Vault**: Secure secret management
- **Application Insights**: Monitoring and telemetry

## Security Features

- **Managed Identity**: App Service uses system-assigned managed identity
- **Key Vault**: SQL credentials stored securely
- **HTTPS Only**: Web app enforces HTTPS
- **Network Security**: Public access with proper firewall rules

## Post-Deployment Steps

1. **Verify Resources**: Check Azure Portal for created resources
2. **Test Database**: Connect to SQL DB and verify schema
3. **Set up CI/CD**: Configure GitHub Actions for automatic deployments
4. **Configure Monitoring**: Set up alerts in Application Insights
5. **Test Application**: Access the web app and verify functionality

## Files in this folder

- `README.md` - This deployment guide
- `deploy.ps1` - Complete PowerShell deployment script
- `deploy.azcli` - Complete Azure CLI deployment script
- `parameters.env.sample` - Sample deployment parameters

<#
focusBreaker Deployment Script (Clean Version)
- Bicep infrastructure deployment
- Azure CLI authentication
- Azure AD-based sqlcmd (no SQL passwords)
- Safe outputs handling
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "rg-focusbreaker",

    [Parameter(Mandatory=$false)]
    [string]$Location = "southeastasia"
)

# ----------------------------
# 1. Azure Login Check
# ----------------------------
Write-Host "Checking Azure CLI login..."

az account show 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Running az login..."
    az login
    if ($LASTEXITCODE -ne 0) {
        throw "Azure login failed"
    }
}

# ----------------------------
# 2. Get identity info
# ----------------------------
Write-Host "Getting user object id..."

$deployerObjectId = az ad signed-in-user show --query id -o tsv

if ([string]::IsNullOrWhiteSpace($deployerObjectId)) {
    throw "Unable to get signed-in user object id. Run az login again."
}

# ----------------------------
# 3. Deployment name
# ----------------------------
$deploymentName = "focusBreaker-$(Get-Date -Format 'yyyyMMddHHmmss')"

# ----------------------------
# 4. Deploy Bicep
# ----------------------------
Write-Host "Deploying Azure infrastructure with Bicep..."

az deployment sub create `
    --name $deploymentName `
    --location $Location `
    --template-file "deployment/main.bicep" `
    --parameters `
        resourceGroupName=$ResourceGroupName `
        location=$Location `
        deploymentPrincipalObjectId=$deployerObjectId

if ($LASTEXITCODE -ne 0) {
    throw "Bicep deployment failed"
}

# ----------------------------
# 5. Get outputs
# ----------------------------
Write-Host "Retrieving deployment outputs..."

$outputs = az deployment sub show `
    --name $deploymentName `
    --query "properties.outputs" -o json | ConvertFrom-Json

if (-not $outputs) {
    throw "Failed to retrieve deployment outputs"
}

$sqlServer = $outputs.sqlServer.value
$webAppUrl = $outputs.webAppUrl.value

Write-Host ""
Write-Host "==============================="
Write-Host "Deployment Successful"
Write-Host "==============================="
Write-Host "Web App URL : $webAppUrl"
Write-Host "SQL Server   : $sqlServer"
Write-Host ""

# ----------------------------
# 6. Resolve SQL Server FQDN
# ----------------------------
$serverFqdn = if ($sqlServer -like "*.database.windows.net") {
    $sqlServer
} else {
    "$sqlServer.database.windows.net"
}

# ----------------------------
# 7. Deploy SQL schema (Azure AD auth)
# ----------------------------
Write-Host "Deploying database schema..."

$sqlPath = "deployment/database-schema.sql"

if (!(Test-Path $sqlPath)) {
    throw "Schema file not found: $sqlPath"
}

# Ensure sqlcmd exists
if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
    throw "sqlcmd not found. Install Microsoft.Sqlcmd via winget."
}

# Allow this machine's public IP to reach the SQL server for schema deployment
Write-Host "Adding temporary SQL firewall rule for this machine..."
$publicIp = (Invoke-RestMethod -Uri "https://api.ipify.org?format=text").Trim()
if ([string]::IsNullOrWhiteSpace($publicIp)) {
    throw "Unable to determine public IP address for SQL firewall rule."
}

az sql server firewall-rule create `
    --resource-group $ResourceGroupName `
    --server $sqlServer `
    --name "AllowClientIP" `
    --start-ip-address $publicIp `
    --end-ip-address $publicIp | Out-Null

try {
    & sqlcmd `
        -S "$serverFqdn" `
        -d "focusbreakerdb" `
        -G `
        -i "$sqlPath"

    if ($LASTEXITCODE -ne 0) {
        throw "Database schema deployment failed"
    }
}
finally {
    Write-Host "Removing temporary SQL firewall rule..."
    az sql server firewall-rule delete `
        --resource-group $ResourceGroupName `
        --server $sqlServer `
        --name "AllowClientIP" | Out-Null
}

# ----------------------------
# 8. Final output
# ----------------------------
Write-Host ""
Write-Host "==============================="
Write-Host "ALL DONE SUCCESSFULLY"
Write-Host "==============================="
Write-Host "App URL: $webAppUrl"
Write-Host ""

# Set up GitHub Actions secret for deployment (if GitHub repo exists)
Write-Host "Setting up GitHub Actions deployment..."
$repoUrl = git config --get remote.origin.url
if ($repoUrl) {
    Write-Host "Detected GitHub repository: $repoUrl"
    Write-Host "Please manually add the following secrets to your GitHub repository:"
    Write-Host "- AZURE_CREDENTIALS: (Service Principal credentials)"
    Write-Host "- AZURE_RESOURCE_GROUP: $ResourceGroupName"
    Write-Host "- AZURE_WEBAPP_NAME: $($outputs.webAppName.value)"
    Write-Host "- AZURE_SUBSCRIPTION_ID: $(az account show --query id -o tsv)"
}

Write-Host "Deployment completed successfully!"
Write-Host "Next steps:"
Write-Host "1. Push your code to GitHub"
Write-Host "2. Set up GitHub Actions secrets"
Write-Host "3. The app will deploy automatically on push to main branch"
Write-Host "4. Access your app at: $webAppUrl"
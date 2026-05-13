# Deployment Credentials Guide

These are the only secrets and environment values you need to deploy the current focusBreaker implementation with Bicep.

## 0. Azure account with subscription access

Purpose
- Required to run the Bicep deployment and create Azure resources.

How to obtain
1. Sign in to the Azure Portal with your Azure for Students account.
2. Confirm you have an active subscription.
3. Make sure you have permission to create resource groups and resources.

Where to use it
- Azure Portal or Azure CLI session before deployment

## 1. `SQL_ADMIN_PASSWORD` deployment environment variable

Purpose
- Used by `deployment/main.bicepparam` to supply the secure SQL admin password to Bicep.

How to obtain
1. Choose a strong password yourself.
2. Store it temporarily in your shell as `SQL_ADMIN_PASSWORD` before deployment.
3. Keep it out of source control.

Where to set it
- PowerShell or cmd session before running the Bicep deployment command
- Example:
	- PowerShell: `$env:SQL_ADMIN_PASSWORD = '<your-strong-password>'`
	- cmd: `set SQL_ADMIN_PASSWORD=<your-strong-password>`

## 2. Azure SQL connection string

Purpose
- Used by `lib/server/timer-store.ts` to read and write the timer snapshot in Azure SQL.

How to obtain
1. In the Azure Portal, open your Azure SQL Server.
2. Create or choose the target database.
3. Open the database connection strings blade.
4. Copy the ADO.NET or JDBC-style connection string.
5. Replace the password placeholder with the SQL admin password or a Key Vault secret reference.

Where to set it
- App Service Configuration as `AZURE_SQL_CONNECTION_STRING` if you want to override the value provisioned by Bicep
- Local development `.env.local` if you want to test against Azure SQL

## 3. Azure SQL admin password

Purpose
- Needed only if you create the Azure SQL server/database through the CLI script.

How to obtain
1. When creating the SQL server in the Azure Portal or Azure CLI, choose a strong password.
2. Store it in a password manager or Key Vault.
3. Use it to compose the SQL connection string.

Where to set it
- Temporary local environment variable for the Bicep deployment
- Prefer storing it in Azure Key Vault after deployment

## 4. Azure Web App publish profile

Purpose
- Used by the GitHub Actions workflow to deploy the app to Azure App Service.

How to obtain
1. Open your Azure App Service in the Azure Portal.
2. Select Get publish profile.
3. Download the `.PublishSettings` file.
4. Copy the XML content into the GitHub secret named `AZURE_WEBAPP_PUBLISH_PROFILE`.

Where to set it
- GitHub repository secret `AZURE_WEBAPP_PUBLISH_PROFILE`

When needed
- Only if you keep using the GitHub Actions deploy workflow

## 5. Azure Web App name

Purpose
- Identifies the target App Service in the GitHub Actions deployment workflow.

How to obtain
1. Create or open the App Service in Azure.
2. Copy the resource name exactly as shown in the Azure Portal.

Where to set it
- GitHub repository secret `AZURE_WEBAPP_NAME`

When needed
- Only if you keep using the GitHub Actions deploy workflow

## 6. Azure Key Vault secret references or environment values

Purpose
- Optional if you want to keep the SQL connection string out of App Service settings.

How to obtain
1. Create a Key Vault in Azure.
2. Add a secret containing the SQL connection string.
3. Copy the secret URI or add a Key Vault reference in App Service Configuration.

Where to set it
- App Service Configuration or Azure Key Vault access policy / role assignment

## 7. Optional GitHub token for automation

Purpose
- Only needed if you automate repository updates outside of the default GitHub Actions token.

How to obtain
1. In GitHub, open Settings > Developer settings > Personal access tokens.
2. Generate a fine-grained token with repository write access.
3. Store it as a GitHub secret if you need custom automation.

Where to set it
- GitHub secret, only if you build custom automation beyond the existing workflow

## Recommended minimum set

If you are deploying the current codebase with Bicep, the minimum set is:
- Azure account with subscription access
- `SQL_ADMIN_PASSWORD`

If you are also using the GitHub Actions workflow, add:
- `AZURE_WEBAPP_PUBLISH_PROFILE`
- `AZURE_WEBAPP_NAME`

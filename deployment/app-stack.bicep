targetScope = 'resourceGroup'

@description('Azure region for all resources.')
param location string

@description('App Service name.')
param appName string

@description('Azure SQL server name.')
param sqlServerName string

@description('Azure SQL database name.')
param sqlDatabaseName string

@description('Storage account name for exports/backups.')
param storageAccountName string

@description('Key Vault name used for secret storage.')
param keyVaultName string

@description('Application Insights resource name.')
param appInsightsName string

@description('Azure SQL administrator login name.')
param sqlAdminLogin string

@secure()
@description('Azure SQL administrator password.')
param sqlAdminPassword string

@description('Microsoft Entra object id of the identity deploying this template.')
param deploymentPrincipalObjectId string

var appServicePlanName = '${appName}-plan'
var sqlConnectionSecretName = 'sql-connection-string'
var sqlAdminPasswordSecretName = 'sql-admin-password'
var sqlConnectionString = 'Server=tcp:${sqlServerName}.${environment().suffixes.sqlServerHostname},1433;Initial Catalog=${sqlDatabaseName};Persist Security Info=False;User ID=${sqlAdminLogin};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'

resource appServicePlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2024-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    publicNetworkAccess: 'Enabled'
    supportsHttpsTrafficOnly: true
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

resource sqlServer 'Microsoft.Sql/servers@2024-11-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

resource sqlAadAdmin 'Microsoft.Sql/servers/administrators@2024-05-01-preview' = {
  parent: sqlServer
  name: 'activeDirectory'
  properties: {
    administratorType: 'ActiveDirectory'
    login: 'aad-admin'
    sid: deploymentPrincipalObjectId
    tenantId: tenant().tenantId
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2024-11-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  sku: {
    name: 'S0'
    tier: 'Standard'
  }
  properties: {
    autoPauseDelay: -1
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2024-11-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: tenant().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enabledForTemplateDeployment: true
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enableRbacAuthorization: false
    accessPolicies: [
      {
        tenantId: tenant().tenantId
        objectId: deploymentPrincipalObjectId
        permissions: {
          secrets: [
            'get'
            'list'
            'set'
            'delete'
            'purge'
            'recover'
          ]
        }
      }
    ]
    publicNetworkAccess: 'Enabled'
    softDeleteRetentionInDays: 90
  }
}

resource sqlAdminPasswordSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: sqlAdminPasswordSecretName
  properties: {
    value: sqlAdminPassword
  }
}

resource sqlConnectionSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: sqlConnectionSecretName
  properties: {
    value: sqlConnectionString
  }
}

resource webApp 'Microsoft.Web/sites@2024-11-01' = {
  name: appName
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      alwaysOn: true
      healthCheckPath: '/api/health'
      linuxFxVersion: 'NODE|22-lts'
      appCommandLine: 'npm start'
      appSettings: [
        {
          name: 'AZURE_SQL_CONNECTION_STRING'
          value: sqlConnectionString
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '22-lts'
        }
        {
          name: 'WEBSITES_CONTAINER_START_TIME_LIMIT'
          value: '1800'
        }
        {
          name: 'WEBSITES_PORT'
          value: '3000'
        }
      ]
    }
  }
}

output defaultHostName string = webApp.properties.defaultHostName
output appServicePlanName string = appServicePlan.name
output storageAccountName string = storageAccount.name
output sqlServerFqdn string = '${sqlServer.name}.${environment().suffixes.sqlServerHostname}'
output appInsightsConnectionString string = appInsights.properties.ConnectionString

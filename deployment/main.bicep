targetScope = 'subscription'

@description('Name of the resource group that will contain the project resources.')
param resourceGroupName string = 'rg-focusbreaker'

@description('Azure region for the deployment.')
param location string = deployment().location

@description('Azure SQL administrator login name.')
param sqlAdminLogin string = 'sqladminuser'

@secure()
@description('Azure SQL administrator password.')
param sqlAdminPassword string

@description('Microsoft Entra object id of the identity deploying this template.')
param deploymentPrincipalObjectId string

var suffix = uniqueString(subscription().id, resourceGroupName)
var appName = 'focusbreaker-${suffix}'
var sqlServerName = 'sqlfb${suffix}'
var sqlDatabaseName = 'focusbreakerdb'
var storageAccountName = toLower('fb${suffix}store')
var keyVaultName = toLower('kvfb${suffix}')
var appInsightsName = 'appi-fb-${suffix}'

resource projectRg 'Microsoft.Resources/resourceGroups@2024-11-01' = {
  name: resourceGroupName
  location: location
}

module appStack './app-stack.bicep' = {
  name: 'focusBreakerApp'
  scope: projectRg
  params: {
    location: location
    appName: appName
    sqlServerName: sqlServerName
    sqlDatabaseName: sqlDatabaseName
    storageAccountName: storageAccountName
    keyVaultName: keyVaultName
    appInsightsName: appInsightsName
    sqlAdminLogin: sqlAdminLogin
    sqlAdminPassword: sqlAdminPassword
    deploymentPrincipalObjectId: deploymentPrincipalObjectId
  }
}

output resourceGroup string = projectRg.name
output webAppName string = appName
output webAppUrl string = 'https://${appStack.outputs.defaultHostName}'
output sqlServer string = sqlServerName
output keyVault string = keyVaultName

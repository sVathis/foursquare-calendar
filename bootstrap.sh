#!/bin/bash
set -x
source "credentials.sh"
source "definitions.sh"

#Create Resource Group, Storage Account & FunctionApp in Azure
az group create --name $rgName --location $location
az storage account create --name $storageName --location $location --resource-group $rgName --sku Standard_LRS
az functionapp create --name $functionAppName --os-type Windows --storage-account $storageName --consumption-plan-location $location --resource-group $rgName --runtime node --runtime-version 10
az functionapp config appsettings set --name $functionAppName --resource-group $rgName --settings FUNCTIONS_EXTENSION_VERSION=~3

:'
az functionapp identity assign --name $functionAppName --resource-group $rgName

az keyvault create --name $vaultname --resource-group $rgName --location $location
az keyvault secret set --vault-name $vaultname --name FOURSQUARECLIENTID --value $FOURSQUARECLIENTID
az keyvault secret set --vault-name $vaultname --name FOURSQUARECLIENTSECRET --value $FOURSQUARECLIENTSECRET
az keyvault secret set --vault-name $vaultname --name FOURSQUAREACCESSTOKEN --value $FOURSQUAREACCESSTOKEN

principalId=$(az functionapp identity show -n $functionAppName -g $rgName --query principalId -o tsv)
tenantId=$(az functionapp identity show -n $functionAppName -g $rgName --query tenantId -o tsv)

az keyvault set-policy -n $vaultname -g $rgName --object-id $principalId --secret-permissions get

FOURSQUARECLIENTID_SECRET=$(az keyvault secret show -n FOURSQUARECLIENTID --vault-name $vaultname --query "id" -o tsv)
FOURSQUARECLIENTSECRET_SECRET=$(az keyvault secret show -n FOURSQUARECLIENTSECRET --vault-name $vaultname --query "id" -o tsv)
FOURSQUAREACCESSTOKEN_SECRET=$(az keyvault secret show -n FOURSQUAREACCESSTOKEN --vault-name $vaultname --query "id" -o tsv)

az functionapp config appsettings set -n $functionAppName -g $rgName --settings "FOURSQUARECLIENTID=@Microsoft.KeyVault(SecretUri=$FOURSQUARECLIENTID_SECRET)"
az functionapp config appsettings set -n $functionAppName -g $rgName --settings "FOURSQUARECLIENTSECRET=@Microsoft.KeyVault(SecretUri=$FOURSQUARECLIENTSECRET_SECRET)"
az functionapp config appsettings set -n $functionAppName -g $rgName --settings "
'

az functionapp config appsettings set -n $functionAppName -g $rgName --settings "FOURSQUARECLIENTID=$FOURSQUARECLIENTID"
az functionapp config appsettings set -n $functionAppName -g $rgName --settings "FOURSQUARECLIENTSECRET=$FOURSQUARECLIENTSECRET"
az functionapp config appsettings set -n $functionAppName -g $rgName --settings "FOURSQUAREACCESSTOKEN=$FOURSQUAREACCESSTOKEN"


az functionapp config appsettings list --name $functionAppName -g $rgName
#Retrieve these credentials locally
func azure functionapp fetch-app-settings $functionAppName

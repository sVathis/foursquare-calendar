
az group create --name svathis-calendar --location westeurope
az storage account create --name svathiscalendar --location westeurope --resource-group svathis-calendar --sku Standard_LRS
az functionapp create --name svathis-calendar --storage-account svathiscalendar --consumption-plan-location westeurope --resource-group svathis-calendar

func init svathis-calendar --source-control --worker-runtime node
cd svathis-calendar
func azure storage fetch-connection-string svathiscalendar
func new --name foursquare -l javascript --template "Http Trigger"
func azure functionapp publish svathis-calendar --nozip
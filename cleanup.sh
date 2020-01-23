#!/bin/bash
set -x
source "definitions.sh"

 az group delete --name $rgName --yes
 rm local.settings.json
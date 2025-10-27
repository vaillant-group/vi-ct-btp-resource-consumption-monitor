#!/bin/bash
#
# Shortcut script for delete old mtar, build and deploy new mtar and build workzone content
# Version number must be updated for each new mtar version.
#

# from the project root folder:
clear

cd cf
npm install
rm ./mta_archives/btp-resource-consumption_*.mtar
mbt build
cf deploy ./mta_archives/btp-resource-consumption_2.2.1.mtar

cd ..

# from the project root folder:
cd workzone
npm install
npm run build

cd ..

# Display info
echo "################################################################################################################"
echo "# Manual tasks:                                                                                                #"
echo "# - Synchronize your HTML5 Repository by clicking on the refresh icon.                                         #"
echo "# - Upload the generated /workzone/package.zip file.                                                           #"
echo "# - Click on Map aliases, go to Card Aliases and click on + to activate the entry. Save and close this screen. #"
echo "################################################################################################################"

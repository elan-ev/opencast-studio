#!/bin/bash

# Remove old 'build' folder
if [ -d build ]; then
  read -p "Will delete 'build/' folder. Is that OK? [y/N] " -r

  if [[ ! $REPLY =~ ^[Yy]$ ]]
  then
    exit 1
  else
    rm -rf build
  fi
fi


# Build version for root path installation
export PUBLIC_URL=/
npm run build
rm build/static/js/*.map

FILENAME="oc-studio-$(date --utc +%F)-root.tar.gz"
cd build
tar -czf ../$FILENAME *
cd ..


# Build version for root path installation
rm -rf build/
export PUBLIC_URL=/studio
npm run build
rm build/static/js/*.map

FILENAME="oc-studio-$(date --utc +%F)-integrated.tar.gz"
cd build
tar -czf ../$FILENAME *
cd ..


# Delete our temporary folder at the end
rm -rf build/

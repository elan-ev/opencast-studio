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

FILENAME="oc-studio-$(date --utc +%F)-root.tar.gz"
cd build
tar -czf ../$FILENAME *
cd ..


# Build integrated version
rm -rf build/
export PUBLIC_URL=/studio
export REACT_APP_SETTINGS_PATH="/ui/config/studio/settings.toml"
npm run build

FILENAME="oc-studio-$(date --utc +%F)-integrated.tar.gz"
cd build
tar -czf ../$FILENAME *
cd ..


# Delete our temporary folder at the end
rm -rf build/

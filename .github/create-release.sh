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
  rm -rf build
fi

npm ci

# Build version for root path installation
export PUBLIC_PATH=/
npm run build:release

FILENAME="oc-studio-$(date --utc +%F)-root.tar.gz"
cd build
tar -czf ../$FILENAME *
cd ..


# Build integrated version
rm -rf build/
export PUBLIC_PATH=/studio
export SETTINGS_PATH="/ui/config/studio/settings.toml"
npm run build:release

FILENAME="oc-studio-$(date --utc +%F)-integrated.tar.gz"
cd build
tar -czf ../$FILENAME *
cd ..


# Delete our temporary folder at the end
rm -rf build/

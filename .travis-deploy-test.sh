#!/bin/sh

# Immediately cancel if there is no deployment key
if [ -z "${STUDIO_TEST_DEPLOY_KEY}" ]; then
  echo No deployment key. Canceling deployment.
  exit 0
fi

set -eu

# Prepare GitHub SSH key
echo "${STUDIO_TEST_DEPLOY_KEY}" | base64 -d > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa
ssh-keyscan github.com >> ~/.ssh/known_hosts

set -x

if [ "${TRAVIS_PULL_REQUEST:-false}" = "false" ]; then
  srcbranch="${TRAVIS_BRANCH}"
else
  srcbranch="pull-request-${TRAVIS_PULL_REQUEST}"
fi
srcpath="$(pwd)"
builddate="$(date --utc '+%Y%m%d%H%M%S')"
buildno="$(printf '%06d' "${TRAVIS_BUILD_NUMBER}")"
deploydir="build-${builddate}-${TRAVIS_REPO_SLUG}-${buildno}-${srcbranch}"
deploydir="$(echo "${deploydir}" | sed 's/[^a-Z0-9]/-/g')"
export PUBLIC_URL="/${deploydir}"
export REACT_APP_ENABLE_SENTRY=1
export REACT_APP_INCLUDE_LEGAL_NOTICES=1
npm ci
npm run build

# Get target repository
cd
rm -rf studio-test || :
git clone "git@github.com:elan-ev/studio-test.git"
cd studio-test
git checkout gh-pages

# Add new content, but remove large '.map' files
mv "${srcpath}/build/" "${deploydir}"
cp "${srcpath}"/.deploy-settings.toml "${deploydir}/settings.toml"
cd "${deploydir}/static/js/"
rm *.map
cd ../../../

# Build new index
echo '<html><body><ul>' > index.html
find . -maxdepth 1 -name 'build*' -type d \
  | sort -r \
  | sed 's/^\(.*\)$/<li><a href=\1>\1<\/a><\/li>/' >> index.html
echo '</ul></body></html>' >> index.html

git add ./*
commit="$(cd "${srcpath}" && git log --oneline --no-decorate -n1 "${TRAVIS_COMMIT}")"
git commit -m "Build #${TRAVIS_BUILD_NUMBER} ($(date)) | ${commit}"
git push origin gh-pages

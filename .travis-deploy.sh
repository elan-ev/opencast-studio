#!/bin/sh

set -eu

srcpath="$(pwd)"
export REACT_APP_ENABLE_SENTRY=1
export REACT_APP_INCLUDE_LEGAL_NOTICES=1
npm ci
npm run build

# Prepare Github SSH key
echo "${GITHUB_DEPLOY_KEY}" | base64 -d > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa
ssh-keyscan github.com >> ~/.ssh/known_hosts

set -x

# Get target repository
cd
reponame="$(echo "${TRAVIS_REPO_SLUG}" | sed 's_^.*/__')"
rm -rf "$reponame" || :
git clone "git@github.com:${TRAVIS_REPO_SLUG}.git"
cd "$reponame"

# Prepare gh-pages branch
if git checkout gh-pages; then
  # Save CNAME and 404.html
  if [ -f CNAME ]; then
    cname="$(cat CNAME)"
  fi
  if [ -f 404.html ]; then
    cp 404.html ..
  fi

  # Remove all previous files
  git ls-files | while read -r f; do git rm -rf "$f"; done

  # Restore 404.html
  cp ../404.html . || :
else
  git checkout --orphan gh-pages
  git ls-files | while read -r f; do rm -f "$f"; git rm --cached "$f"; done
fi

# Add new content
mv "${srcpath}"/build/* .
cp "${srcpath}"/deploy-settings.json settings.json
if [ -n "${cname:-}" ]; then
  echo "${cname}" > CNAME
fi
git add ./*
commit="$(cd "${srcpath}" && git log --oneline --no-decorate -n1 "${TRAVIS_COMMIT}")"
git commit -m "Build #${TRAVIS_BUILD_NUMBER} ($(date)) | ${commit}"
git push origin gh-pages

#!/bin/sh

srcpath="$(pwd)"
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

# Save CNAME
if [ -f CNAME ]; then
  cname="$(cat CNAME)"
fi

# Prepare gh-pages branch
if git checkout gh-pages; then
  git ls-files | while read -r f; do git rm -rf "$f"; done
else
  git checkout --orphan gh-pages
  git ls-files | while read -r f; do rm -f "$f"; git rm --cached "$f"; done
fi

# Add new content
mv "${srcpath}"/build/* .
if [ -n "${cname:-}" ]; then
  echo "${cname}" > CNAME
fi
git add ./*
commit="$(cd "${srcpath}" && git log --oneline --no-decorate -n1 "${TRAVIS_COMMIT}")"
git commit -m "Build #${TRAVIS_BUILD_NUMBER} ($(date)) | ${commit}"
git push origin gh-pages

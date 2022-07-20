#!/bin/sh

[ $# -eq 0 ] && echo "usage: $0 {major|minor|patch}" && exit 1

if ! [ -z "$(git status --porcelain)" ]; then
  echo 'Git directory is not clean'
  exit 2
fi

if ! [ $(git branch --show-current) = "develop" ]; then
  echo 'You need to be on develop branch'
  exit 3
fi

current_ver=$(grep '"version": "*' package.json | grep -o '\d\+\.\d\+\.\d\+')

new_ver=$( semver -i $1 $current_ver )

echo Creating version $new_ver

jq ".version=\"${new_ver}\"" package.json > package.tmp.json
mv package.tmp.json package.json

git checkout -b release-${new_ver}
git add package.json
git commit -m "Bump version from ${current_ver} to ${new_ver}"
git tag -a release-${new_ver} -m "Create new release ${new_ver}"
git push origin release-${new_ver} --follow-tags

gh pr create --title "Release ${new_ver}" --fill -a "@me"
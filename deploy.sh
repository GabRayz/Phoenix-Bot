#!/bin/sh

version=$(grep '"version": "*' package.json | grep -o '\d\+\.\d\+\.\d\+')
echo $version
docker build -t gabray/phoenix-bot:${version} -t gabray/phoenix-bot:latest .
docker run --entrypoint ./build-and-test.sh gabray/phoenix-bot:${version}

if ! [ $? -eq 0 ]; then
  exit 1
fi

echo "${DOCKERHUB_ACCESS_TOKEN}" | docker login --username gabray --password-stdin

docker push gabray/phoenix-bot:${version}
docker push gabray/phoenix-bot:latest



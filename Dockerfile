FROM node:latest

WORKDIR /usr/src/app/

COPY package.json .

RUN npm install

COPY . .

RUN chmod +x ./build-and-test.sh

EXPOSE 8081

ENTRYPOINT [ "npm", "run", "start" ]

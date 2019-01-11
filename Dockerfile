FROM node:alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install 

COPY . .

RUN npm run build

# stage 2
FROM node:alpine
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY --from=builder /usr/src/app/build ./build
COPY src/schema/typeDefs.graphql ./build/schema/

EXPOSE 5430
CMD node build/index.js

#Stage 1
FROM node:alpine as vue

WORKDIR /usr/src/app
COPY vue-leadership/package*.json ./

RUN npm install
COPY vue-leadership ./

RUN npm run build


#Stage 2
FROM node:alpine as builder

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY src ./
COPY tsconfig.json ./
RUN npm run build


#Stage 3
FROM node:alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install --production

COPY --from=vue /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/build ./
COPY src/schema/typeDefs.graphql ./schema/typeDefs.graphql

EXPOSE 5430

CMD node index.js

FROM node:22-alpine

WORKDIR /usr/src/app

COPY ./websocket/package.json ./package.json

RUN npm install 

COPY ./websocket/ ./

ENV PORT=8080

RUN cd db && npx prisma generate
RUN npm run build 

EXPOSE 8080

CMD ["npm", "run", "start"] 


FROM node:8-alpine

RUN mkdir /app
WORKDIR /app

COPY . .

CMD ["npm", "start"]
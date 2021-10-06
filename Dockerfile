FROM node:12-alpine

WORKDIR /app

COPY . .

RUN npm install --unsafe-perm

CMD ["npm", "start"]

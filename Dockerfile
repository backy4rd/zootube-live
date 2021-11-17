FROM node:14-alpine

WORKDIR /app

RUN apk add ffmpeg

COPY . .

RUN npm install --unsafe-perm

CMD ["npm", "start"]

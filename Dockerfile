FROM node:16-alpine3.16
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build
CMD ["npm", "start"]
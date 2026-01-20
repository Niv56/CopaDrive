FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install -g expo-cli

COPY . .

EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

CMD ["npx", "expo", "start", "--port", "8081"]
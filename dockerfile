FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm version && npm ci

COPY . .

RUN npm run build

RUN rm -rf src/ tsconfig.json tsconfig.build.json nest-cli.json test/

EXPOSE 3000

CMD ["node", "dist/main.js"]

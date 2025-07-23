
FROM node:20

WORKDIR /app-backend

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]

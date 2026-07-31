FROM node:22-alpine
WORKDIR /app
COPY service/client/package.json service/client/package-lock.json* ./
RUN npm install
COPY service/client ./
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

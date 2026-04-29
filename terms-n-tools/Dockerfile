# Etapa 1 - build do frontend
FROM node:18 AS build

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# Etapa 2 - nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
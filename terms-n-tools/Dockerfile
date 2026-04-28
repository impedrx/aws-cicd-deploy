FROM nginx:alpine

# Remove config default (opcional)
RUN rm -rf /usr/share/nginx/html/*

# Copia seus arquivos do projeto
COPY . /usr/share/nginx/html

# Expõe porta 80
EXPOSE 80

# Inicia o nginx
CMD ["nginx", "-g", "daemon off;"]
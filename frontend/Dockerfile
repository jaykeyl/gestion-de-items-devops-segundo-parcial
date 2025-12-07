# STAGE 1: Build de producción
FROM node:18-alpine AS build

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código
COPY . .

# Compilar para producción
RUN npm run build

# STAGE 2: Nginx para servir
FROM nginx:alpine

# Copiar build al directorio público de nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración personalizada opcional
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

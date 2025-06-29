FROM node:22-alpine

# Directorio de trabajo
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Exponer el puerto configurado en .env
EXPOSE 3000

# Levantar la aplicación
CMD ["npm", "start"]
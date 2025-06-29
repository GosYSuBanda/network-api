FROM node:22-alpine

# Directorio de trabajo
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copia package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala solo dependencias de producción
RUN npm ci --only=production

# Copia el resto del código
COPY . .

# Expone el puerto configurado en .env
EXPOSE 3000

# Levanta la aplicación
CMD ["npm", "start"]
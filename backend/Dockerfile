# Usa una imagen oficial y ligera de Node.js
FROM node:20-slim

# Instala Chromium y las dependencias del sistema operativo necesarias para Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcups2 \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Configura variables de entorno para que Puppeteer use el Chromium que acabamos de instalar
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_OPTIONS="--max-old-space-size=256"

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de definición de dependencias
COPY package*.json ./

# Instala todas las dependencias
RUN npm install

# Copia el esquema de Prisma y genera el cliente
COPY prisma ./prisma
RUN npx prisma generate

# Copia el resto del código
COPY . .

# Compila el proyecto NestJS
RUN npm run build

# Expone el puerto (Render por defecto escucha en variables PORT, pero internamente puedes usar el que quieras)
EXPOSE 3001

# Comando para iniciar la aplicación en producción
CMD ["npm", "run", "start:prod"]

# Dockerfile pour le frontend
FROM node:18-alpine

WORKDIR /app

# Installer les dépendances
COPY package.json package-lock.json* ./
RUN npm ci

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 5173

# Commande de démarrage
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
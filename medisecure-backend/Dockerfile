# medisecure-backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Installer les dépendances et le client PostgreSQL
RUN apt-get update && \
    apt-get install -y --no-install-recommends postgresql-client gcc python3-dev libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances
COPY requirements.txt .
COPY pyproject.toml .

# Installer les dépendances
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY . .

# Définir la variable PYTHONPATH
ENV PYTHONPATH=/app

# Définir le point d'entrée avec un script pour attendre que la base de données soit prête
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Commande pour exécuter l'application
CMD ["/start.sh"]
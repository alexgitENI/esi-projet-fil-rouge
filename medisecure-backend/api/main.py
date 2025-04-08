# medisecure-backend/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
import logging
from dotenv import load_dotenv

from api.handlers.exception_handlers import (
    AppException, 
    app_exception_handler, 
    http_exception_handler, 
    validation_exception_handler
)
from api.middlewares.authentication_middleware import AuthenticationMiddleware

# Importer les routers
from patient_management.infrastructure.adapters.primary.controllers.patient_controller import router as patient_router
from api.controllers.auth_controller import router as auth_router
from appointment_management.infrastructure.adapters.primary.controllers.appointment_controller import router as appointment_router

# Importer et configurer le container
from shared.container.container import Container

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Charger les variables d'environnement
load_dotenv()

# Initialiser le container
container = Container()
try:
    container.configure_for_environment()
except AttributeError:
    logging.warning("La méthode configure_for_environment n'est pas disponible sur le container")

# Informations de version pour l'API
API_VERSION = "1.0.0"
API_PREFIX = os.getenv("API_PREFIX", "/api")

app = FastAPI(
    title="MediSecure API",
    description="API pour la gestion des dossiers patients et des rendez-vous médicaux",
    version=API_VERSION,
    docs_url=f"{API_PREFIX}/docs",
    redoc_url=f"{API_PREFIX}/redoc",
    openapi_url=f"{API_PREFIX}/openapi.json",
)

# Configuration CORS
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache les préférences CORS pendant 10 minutes
)

# Middleware d'authentification
app.middleware("http")(AuthenticationMiddleware())

# Enregistrement des gestionnaires d'exceptions
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Modification importante: Appliquer le préfixe API à tous les routers
# Ne pas inclure directement les routers sans préfixe
app.include_router(patient_router, prefix=API_PREFIX)
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(appointment_router, prefix=API_PREFIX)

@app.get(f"{API_PREFIX}/health")
async def health_check():
    """Endpoint de vérification de l'état de l'API"""
    return {
        "status": "healthy",
        "version": API_VERSION,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Événement de démarrage de l'application
@app.on_event("startup")
async def startup_event():
    logger.info("=== MediSecure API démarrée ===")
    logger.info(f"Version: {API_VERSION}")
    logger.info(f"Environnement: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Préfixe API: {API_PREFIX}")
    
    # Ajouté pour déboguer: afficher toutes les routes
    for route in app.routes:
        logger.info(f"Route: {route.path}, methods: {route.methods}")

# Événement d'arrêt de l'application
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("=== MediSecure API arrêtée ===")

if __name__ == "__main__":
    import uvicorn
    
    # Configurer le serveur Uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    
    logger.info(f"Démarrage du serveur sur {host}:{port} (reload: {reload})")
    uvicorn.run("api.main:app", host=host, port=port, reload=reload)
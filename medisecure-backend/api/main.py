from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
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

load_dotenv()

app = FastAPI(
    title="MediSecure API",
    description="API pour la gestion des dossiers patients et des rendez-vous médicaux",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les origines exactes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware d'authentification
app.middleware("http")(AuthenticationMiddleware())

# Enregistrement des gestionnaires d'exceptions
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Enregistrement des routers
app.include_router(patient_router)

@app.get("/api/health")
async def health_check():
    """Endpoint de vérification de l'état de l'API"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
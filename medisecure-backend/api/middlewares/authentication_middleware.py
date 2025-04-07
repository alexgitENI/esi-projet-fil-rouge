from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional, Dict, Any
import os
from datetime import datetime, timedelta
import logging

# Configuration du logging
logger = logging.getLogger(__name__)

security = HTTPBearer()

class AuthenticationMiddleware:
    """Middleware pour vérifier l'authentification JWT"""
    
    def __init__(self):
        self.jwt_secret = os.getenv("JWT_SECRET_KEY", "default_secret_key")
        self.algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        
    async def __call__(self, request: Request, call_next):
        """Vérifie le token JWT et ajoute l'utilisateur à la requête"""
        
        # Chemins exemptés d'authentification
        exempt_paths = [
            "/api/health", 
            "/api/docs", 
            "/api/redoc", 
            "/api/openapi.json", 
            "/api/auth/login", 
            "/api/auth/logout"
        ]
        
        # Méthode OPTIONS pour les requêtes CORS preflight
        if request.method == "OPTIONS":
            return await call_next(request)
            
        # Vérifier si le chemin est exempté
        if any(request.url.path.startswith(path) for path in exempt_paths):
            return await call_next(request)
        
        # Récupérer le token d'autorisation
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            logger.warning(f"Tentative d'accès sans token: {request.url.path}")
            return await call_next(request)
        
        try:
            # Extraction du token
            scheme, token = auth_header.split()
            if scheme.lower() != "bearer":
                return await call_next(request)
                
            # Validation du token
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.algorithm])
            
            # Vérification de l'expiration
            exp = payload.get("exp")
            if exp and datetime.utcnow() > datetime.fromtimestamp(exp):
                logger.warning(f"Token expiré pour: {request.url.path}")
                return await call_next(request)
            
            # Ajout de l'utilisateur à la requête
            request.state.user = payload
            logger.debug(f"Utilisateur authentifié: {payload.get('email')} accède à {request.url.path}")
            
            return await call_next(request)
            
        except JWTError as e:
            logger.warning(f"Erreur JWT pour {request.url.path}: {str(e)}")
            return await call_next(request)
        except Exception as e:
            logger.error(f"Erreur d'authentification pour {request.url.path}: {str(e)}")
            return await call_next(request)
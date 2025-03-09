from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional, Dict, Any
import os
from datetime import datetime, timedelta

security = HTTPBearer()

class AuthenticationMiddleware:
    """Middleware pour vérifier l'authentification JWT"""
    
    def __init__(self):
        self.jwt_secret = os.getenv("JWT_SECRET_KEY", "default_secret_key")
        self.algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        
    async def __call__(self, request: Request, call_next):
        """Vérifie le token JWT et ajoute l'utilisateur à la requête"""
        
        # Chemins exemptés d'authentification
        exempt_paths = ["/api/health", "/api/docs", "/api/redoc", "/api/openapi.json", "/api/auth/login"]
        if any(request.url.path.startswith(path) for path in exempt_paths):
            return await call_next(request)
        
        try:
            # Extraction du token
            credentials: HTTPAuthorizationCredentials = await security(request)
            token = credentials.credentials
            
            # Validation du token
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.algorithm])
            
            # Vérification de l'expiration
            exp = payload.get("exp")
            if exp and datetime.utcnow() > datetime.fromtimestamp(exp):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expired",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Ajout de l'utilisateur à la requête
            request.state.user = payload
            
            return await call_next(request)
            
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Authentication error: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )
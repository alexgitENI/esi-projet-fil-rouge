from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.future import select
from datetime import timedelta
import os

from shared.container.container import Container
from shared.application.dtos.common_dtos import TokenResponseDTO
from shared.infrastructure.database.models.user_model import UserModel

# Créer un router pour les endpoints d'authentification
router = APIRouter(prefix="/api/auth", tags=["auth"])

def get_container():
    """Fournit le container d'injection de dépendances."""
    return Container()

@router.post("/login", response_model=TokenResponseDTO)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    container: Container = Depends(get_container)
):
    try:
        # Récupérer les dépendances
        authenticator = container.authenticator()
        session = container.db_session()
        
        # Rechercher l'utilisateur directement avec une requête SQL
        query = select(UserModel).where(UserModel.email == form_data.username)
        result = await session.execute(query)
        user_model = result.scalar_one_or_none()
        
        if not user_model:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Vérifier si l'utilisateur est actif
        if not user_model.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur inactif",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Vérifier le mot de passe
        is_password_valid = authenticator.verify_password(form_data.password, user_model.hashed_password)
        
        if not is_password_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Créer les données à encoder dans le token
        token_data = {
            "sub": str(user_model.id),
            "email": user_model.email,
            "role": user_model.role.value,
            "name": f"{user_model.first_name} {user_model.last_name}"
        }
        
        # Créer le token avec une durée d'expiration
        access_token = authenticator.create_access_token(
            data=token_data,
            expires_delta=timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30")))
        )
        
        # Créer la réponse
        return TokenResponseDTO(
            access_token=access_token,
            token_type="bearer",
            expires_in=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30")) * 60,
            user={
                "id": str(user_model.id),
                "email": user_model.email,
                "first_name": user_model.first_name,
                "last_name": user_model.last_name,
                "role": user_model.role.value,
                "is_active": user_model.is_active,
                "created_at": user_model.created_at.isoformat(),
                "updated_at": user_model.updated_at.isoformat()
            }
        )
        
    except Exception as e:
        print(f"Erreur d'authentification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Une erreur est survenue: {str(e)}",
        )

@router.post("/logout")
async def logout():
    """Route de déconnexion."""
    return {"detail": "Déconnexion réussie"}
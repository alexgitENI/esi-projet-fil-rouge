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
        user_repository = container.user_repository()
        authenticator = container.authenticator()
        
        # Rechercher l'utilisateur par email
        user = await user_repository.get_by_email(form_data.username)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Vérifier si l'utilisateur est actif
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur inactif",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Récupérer le mot de passe haché de l'utilisateur
        query = select(UserModel.hashed_password).where(UserModel.id == user.id)
        result = await user_repository.session.execute(query)
        hashed_password = result.scalar_one_or_none()
        
        # Vérifier le mot de passe
        is_password_valid = authenticator.verify_password(form_data.password, hashed_password)
        
        if not is_password_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Créer les données à encoder dans le token
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "name": f"{user.first_name} {user.last_name}"
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
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role.value,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat()
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

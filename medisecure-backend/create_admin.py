import uuid
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from shared.services.authenticator.basic_authenticator import BasicAuthenticator
from shared.infrastructure.database.models.user_model import UserModel, UserRole

def create_admin_user():
    # Configuration de la base de données
    DATABASE_URL = 'postgresql://postgres:postgres@db:5432/medisecure'
    
    # Créer le moteur et la session
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Créer un authentificateur pour générer le hash du mot de passe
        authenticator = BasicAuthenticator()
        
        # Définir les informations de l'utilisateur admin
        admin_email = 'admin@medisecure.com'
        admin_password = 'Admin123!'
        admin_id = uuid.uuid4()
        
        # Générer le hash du mot de passe
        hashed_password = authenticator.get_password_hash(admin_password)
        
        # Créer l'utilisateur admin
        admin_user = UserModel(
            id=admin_id,
            email=admin_email,
            hashed_password=hashed_password,
            first_name='Admin',
            last_name='User',
            role=UserRole.ADMIN,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Ajouter l'utilisateur à la base de données
        session.add(admin_user)
        session.commit()
        
        print(f'Utilisateur administrateur créé avec succès:')
        print(f'Email: {admin_email}')
        print(f'Mot de passe: {admin_password}')
        print(f'ID: {admin_id}')
        
        # Générer un exemple de token JWT pour l'authentification
        token_data = {
            'sub': str(admin_id),
            'email': admin_email,
            'role': 'admin',
            'name': 'Admin User'
        }
        token = authenticator.create_access_token(token_data)
        
        print('\nToken JWT pour tester l\'API:')
        print(token)
        print('\nUtilisez ce token dans l\'en-tête Authorization: Bearer <token>')
        
    except Exception as e:
        session.rollback()
        print(f'Erreur lors de la création de l\'utilisateur admin: {str(e)}')
    finally:
        session.close()

if __name__ == '__main__':
    create_admin_user()
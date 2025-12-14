# to get a string like this run:
# openssl rand -hex 32
import os
from typing import Annotated

from dns.message import AUTHORITY
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi_another_jwt_auth import AuthJWT
from fastapi_another_jwt_auth.exceptions import AuthJWTException
from pwdlib import PasswordHash
from pydantic import BaseModel
from sqlmodel import select
from starlette import status

from model.Profile import Profile
from model.User import User, UserPublic, UserCreate, UserProfilePublic
from model.database import SessionDep

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES')

class Settings(BaseModel):
    authjwt_secret_key: str = SECRET_KEY
    authjwt_access_token_expire: int = int(ACCESS_TOKEN_EXPIRE_MINUTES) * 60

@AuthJWT.load_config
def get_config():
    return Settings()

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

router = APIRouter()

AuthJWTDep = Annotated[AuthJWT, Depends()]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password):
    return password_hash.hash(password)


def get_user(username: str, session: SessionDep) -> User | None:
    return session.exec(select(User).where(User.username == username)).first()
       

def authenticate_user(username: str, password: str, session: SessionDep): 
    user = get_user(username, session)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    

def create_access_token(username: str):
    access_token = AuthJWT.create_access_token(self=AuthJWT(), subject=username)
    refresh_token = AuthJWT.create_refresh_token(self=AuthJWT(), subject=username)
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="Bearer")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Please sign in to continue.",
    headers={"WWW-Authenticate": "Bearer"}
)

access_denied_exception = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="You don't have access to this resource",
    headers={"WWW-Authenticate": "Bearer"}
)



async def get_current_user(token: TokenDep, session: SessionDep, authorize: AuthJWTDep) -> User:
    try: 
        username = authorize.get_raw_jwt(token)["sub"]
        if not username: 
            raise credentials_exception
    except AuthJWTException:
        raise credentials_exception
    
    user = get_user(username, session)
    if not user:
        raise credentials_exception
    return user


async def does_user_have_access(user_id: Annotated[int, Path(title = "id of user")], current_user: Annotated[User, Depends(get_current_user)]) -> User:
    if current_user.user_id != user_id:
        raise access_denied_exception
    return current_user


@router.post("/signup")
async def signup(user_create: UserCreate, session: SessionDep) -> Token:
    user = get_user(user_create.username, session)
    if user is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken.")
    user = User(username=user_create.username, password=get_password_hash(user_create.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    profile = Profile(first_name=user_create.first_name, last_name=user_create.last_name, user_id=user.user_id)
    session.add(profile)
    session.commit()
    return create_access_token(user.username)
        

@router.post("/login")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep) -> Token:
    user = authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return create_access_token(form_data.username)


@router.get("/current_user", response_model=UserProfilePublic)
async def get_current_user(current_user: Annotated[User, Depends(get_current_user)]):
    profile = current_user.profile
    return UserProfilePublic(user_id=current_user.user_id, username=current_user.username,
                             first_name=profile.first_name, last_name=profile.last_name)


@router.get("/users/{user_id}", response_model=UserPublic)
async def read_user(current_user: Annotated[User, Depends(does_user_have_access)] ) -> UserPublic:
    return current_user
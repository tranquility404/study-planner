import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI()

# Security Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-32-char-secret-key-here-change-me!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security Setup
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User Database File
USER_DB_FILE = "users.json"

# Models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    identifier: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

# Database Helpers
def get_users() -> list:
    """Load users from JSON file"""
    if not os.path.exists(USER_DB_FILE):
        return []
    try:
        with open(USER_DB_FILE, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []

def save_user(user: dict):
    """Save user to JSON file"""
    users = get_users()
    users.append(user)
    with open(USER_DB_FILE, "w") as f:
        json.dump(users, f, indent=2)

def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by user_id"""
    users = get_users()
    for user in users:
        if user["user_id"] == user_id:
            return user
    return None

# Security Helpers
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)

def create_access_token(user_id: str) -> str:
    """Create JWT access token"""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """Authentication dependency"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_id(user_id)
    if user is None:
        raise credentials_exception

    return user

# Routes
@app.post("/signup", response_model=Token)
async def signup(user_data: UserCreate):
    """User registration endpoint"""
    users = get_users()

    # Check existing users
    if any(u["username"] == user_data.username for u in users):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    if any(u["email"] == user_data.email for u in users):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    new_user = {
        "user_id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password
    }

    save_user(new_user)
    return {
        "access_token": create_access_token(user_id),
        "token_type": "bearer"
    }

@app.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    """User authentication endpoint"""
    users = get_users()
    for user in users:
        identifier_match = (
            user["username"] == login_data.identifier or
            user["email"] == login_data.identifier
        )
        if identifier_match and verify_password(login_data.password, user["hashed_password"]):
            return {
                "access_token": create_access_token(user["user_id"]),
                "token_type": "bearer"
            }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

@app.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    """Example protected endpoint"""
    return {
        "message": f"Hello {current_user['username']}!",
        "user_id": current_user["user_id"],
        "email": current_user["email"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
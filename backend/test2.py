from ai import AzureOpenAIChatClient
from fastapi import FastAPI, UploadFile, File, Form, Depends, Header, HTTPException
from fastapi.responses import JSONResponse
from mongodb import MongoDBHandler
import os
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import Optional
import uuid
from bson import ObjectId
import jwt
from datetime import datetime, timedelta

app = FastAPI()
azure_ai = AzureOpenAIChatClient()
mongo_stuff = MongoDBHandler()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CREDENTIALS_FILE = "credentials.json"
SECRET_KEY = "your-secret-key-here-1234567890"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class SignUpRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    identifier: str
    password: str

def load_credentials():
    if not os.path.exists(CREDENTIALS_FILE):
        return []
    with open(CREDENTIALS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_credentials(data):
    with open(CREDENTIALS_FILE, "w") as f:
        json.dump(data, f, indent=2)

def create_jwt_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user(authorization: str = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization[7:]
    payload = verify_jwt_token(token)
    if not payload:
        return None
    return payload.get("sub")

def serialize_mongo_doc(doc):
    if isinstance(doc, list):
        return [serialize_mongo_doc(d) for d in doc]
    if isinstance(doc, dict):
        return {k: str(v) if isinstance(v, ObjectId) else v for k, v in doc.items()}
    return doc

@app.post("/signup")
def signup(user: SignUpRequest):
    users = load_credentials()
    user_id = str(uuid.uuid4())
    
    for u in users:
        if u.get("username") == user.username:
            return {"status": 1, "message": "Username already exists"}
        if u.get("email") == user.email:
            return {"status": 1, "message": "Email already registered"}

    new_user = {
        "username": user.username,
        "email": user.email,
        "password": user.password,
        "user_id": user_id
    }
    users.append(new_user)
    save_credentials(users)
    
    token = create_jwt_token({"sub": user_id})
    return {"status": 0, "message": "Signup successful", "token": token}

@app.post("/login")
def login(login_data: LoginRequest):
    users = load_credentials()
    for u in users:
        username_match = u.get("username", "") == login_data.identifier
        email_match = u.get("email", "") == login_data.identifier
        password_match = u.get("password", "") == login_data.password
        
        if (username_match or email_match) and password_match:
            token = create_jwt_token({"sub": u.get("user_id")})
            return {"status": 0, "message": "Login successful", "token": token}
    return {"status": 1, "message": "Invalid credentials"}

@app.post("/generate-time-table/")
async def generate_time_table(
    text: Optional[str] = Form(None),
    current_user: Optional[str] = Depends(get_current_user)
):
    if not current_user:
        return {"status": 1, "message": "Invalid or missing token"}
    
    users = load_credentials()
    user = next((u for u in users if u.get("user_id") == current_user), None)
    if not user:
        return {"status": 1, "message": "User not found"}
    
    info = azure_ai.generate_time_table(text)
    
    if info.startswith("```json"):
        info = info[len("```json"):].strip()
    if info.endswith("```"):
        info = info[:-3].strip()

    try:
        data = json.loads(info)
    except json.JSONDecodeError:
        return {"status": 1, "message": "Invalid JSON returned from AI"}
    
    inserted_id = mongo_stuff.save_info_in_data(
        user_id=current_user,
        username=user.get("username", ""),
        schedule_data={"time table": data, "gathered_data": json.loads(text)}
    )[0]

    file_path = "mongo_db_ids.json"
    new_entry = {"Mongodb_id": str(inserted_id), "user_id": current_user}

    try:
        with open(file_path, 'r') as file:
            existing_data = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        existing_data = []

    existing_data.append(new_entry)
    with open(file_path, 'w') as file:
        json.dump(existing_data, file, indent=2)

    return {
        "status": 0,
        "message": "Schedule saved",
        "Mongodb_id": str(inserted_id),
        "user_id": current_user
    }

@app.post("/fetch-time-table/")
async def fetch_time_table(
    text: Optional[str] = Form(None),
    current_user: Optional[str] = Depends(get_current_user)
):
    if not current_user:
        return {"status": 1, "message": "Invalid or missing token"}
    
    if not text:
        return {"status": 1, "message": "Missing document ID"}
    
    fetched_doc = mongo_stuff.fetch_info_data(text)
    if not fetched_doc or fetched_doc.get("user_id") != current_user:
        return {"status": 1, "message": "Document not found or unauthorized access"}

    return {"status": 0, "data": serialize_mongo_doc(fetched_doc)}

@app.post("/get-all-time-table/")
async def get_all_time_table(current_user: Optional[str] = Depends(get_current_user)):
    if not current_user:
        return {"status": 1, "message": "Invalid or missing token"}
    
    try:
        with open("mongo_db_ids.json", 'r') as file:
            data = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []
    
    user_data = [entry for entry in data if entry.get("user_id") == current_user]
    return user_data
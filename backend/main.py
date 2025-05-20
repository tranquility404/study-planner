from ai import AzureOpenAIChatClient
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import base64
from mongodb import MongoDBHandler
import os
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import Optional, Union
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

def serialize_mongo_doc(doc):
    if isinstance(doc, list):
        return [serialize_mongo_doc(d) for d in doc]
    if isinstance(doc, dict):
        return {k: str(v) if isinstance(v, ObjectId) else v for k, v in doc.items()}
    return doc

@app.get("/health")
def health():
    return {"status": 200}

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
async def generate_time_table(text: Optional[str] = Form(None)):
    encoded_pdf = f"{text}"
    info = azure_ai.generate_time_table(encoded_pdf)
    
    if info.startswith("```json"):
        info = info[len("```json"):].strip()
    if info.endswith("```"):
        info = info[:-3].strip()

    try:
        data = json.loads(info)
    except json.JSONDecodeError:
        return {"status": 1, "message": "Invalid JSON returned from AI"}
    
    data.append({"score_data":[
    {
      "date": "00:00:00",
      "todaysScore": 0,
      "studySessions": [
        {
          "subject": "A",
          "durationMinutes": 50,
          "points": 0,
          "status": "pending"
        },
        {
          "subject": "B",
          "durationMinutes": 50,
          "points": 0,
          "status": "pending"
        }
      ],
      "challengeProgress": {
        "completed": 0,
        "total": 2,
        "pointsEarned": 0,
        "pointsTotal": 100
      },
      "studyNotes": "here is my data"
    }]})

    inserted_id = mongo_stuff.save_info_in_data(
        user_id="ebea5c71-0c34-4aae-a1ca-566fc7a6eaf1",
        username="Tranquility",
        schedule_data={"time table": data, "gathered_data": json.loads(text)}
    )[0]

    file_path = "mongo_db_ids.json"
    new_entry = {"Mongodb_id": str(inserted_id), "user_id": "Tranquility"}

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
        # "user_id": actual_user_id
    }

@app.post("/fetch-time-table/")
async def fetch_time_table(text: Optional[str] = Form(None)):
    fetched_doc = mongo_stuff.fetch_info_data(text)
    return {"status": 0, "data": serialize_mongo_doc(fetched_doc)}

def convert_object_ids(doc):
    """Recursively convert all ObjectId fields to string."""
    if isinstance(doc, dict):
        return {k: convert_object_ids(v) for k, v in doc.items()}
    elif isinstance(doc, list):
        return [convert_object_ids(item) for item in doc]
    elif isinstance(doc, ObjectId):
        return str(doc)
    else:
        return doc

@app.post("/get-all-time-table/")
async def get_all_time_table():
    try:
        with open("mongo_db_ids.json", 'r') as file:
            data = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        data = []

    dc = []
    for i in data:
        fetched_doc = mongo_stuff.fetch_info_data(i["Mongodb_id"])
        if fetched_doc:
            cleaned_doc = convert_object_ids(fetched_doc)
            dc.append(cleaned_doc)

    return dc

@app.post("/delete-time-table/")
async def delete_time_table(text: Optional[str] = Form(None)):
    fetched_doc = mongo_stuff.delete_info_data(text)
    if fetched_doc==True:
        return {"output":"done"}
    elif fetched_doc==False:
        return {"output":"sorry data is not avai.."}

@app.post("/study-buddy-chatbot/")
async def study_buddy_chatbot(text: str = Form(...),mongodb_id: str = Form(...)):
    text_output=azure_ai.chatbot(text)
    return text_output

@app.post("/score-data-update/")
async def score_data_update(mongodb_id: str = Form(...), json_data: str = Form(...)):
    def replace_score_data_in_json(data, new_score_data):
        time_table = data['data']['schedule']['time table']
        score_data_index = None
        for i, item in enumerate(time_table):
            if 'score_data' in item:
                score_data_index = i
                break
        if score_data_index is not None:
            time_table[score_data_index]['score_data'] = [new_score_data]
        else:
            time_table.append({'score_data': [new_score_data]})
        return data
    original_data =mongo_stuff.fetch_info_data(mongodb_id)
    new_score_data = json_data
    updated_json = replace_score_data_in_json(original_data, new_score_data)
    return updated_json

@app.post("/ping/")
async def get_all_time_table():
    return "pong"
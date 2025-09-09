from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import json
import os
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from bson.objectid import ObjectId

router = APIRouter()

# Security
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# MongoDB connection
def get_mongodb_client():
    try:
        client = MongoClient("mongodb://localhost:27017/")
        return client
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
    region: str

class User(BaseModel):
    user: str
    region: str
    password: str

# Password verification (for demo purposes, we'll use plain text comparison)
# In production, passwords should be hashed
def verify_password(plain_password: str, stored_password: str) -> bool:
    return plain_password == stored_password

# JWT token creation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# JWT token verification
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Get user from database
def get_user_from_db(username: str):
    client = get_mongodb_client()
    try:
        db = client.app_db
        collection = db.trigger_tpr
        user = collection.find_one({"user": username})
        if user:
            # Convert ObjectId to string for JSON serialization
            user["_id"] = str(user["_id"])
            return user
        return None
    finally:
        client.close()

# Update login time
def update_login_time(username: str):
    client = get_mongodb_client()
    try:
        db = client.app_db
        collection = db.trigger_tpr
        result = collection.update_one(
            {"user": username},
            {"$set": {"loginTime": datetime.utcnow().isoformat()}}
        )
        return result.modified_count > 0
    finally:
        client.close()

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Authenticate user and return JWT token
    """
    try:
        # Get user from database
        user = get_user_from_db(login_data.username)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        # Verify password
        if not verify_password(login_data.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        
        # Update login time
        update_login_time(login_data.username)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["user"], "region": user["region"]},
            expires_delta=access_token_expires
        )
        
        # Return response
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user["_id"],
                "username": user["user"],
                "region": user["region"]
            },
            region=user["region"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/verify")
async def verify_user(current_user: dict = Depends(verify_token)):
    """
    Verify JWT token and return user info
    """
    return {
        "username": current_user.get("sub"),
        "region": current_user.get("region"),
        "valid": True
    }

@router.get("/environments")
async def get_environments():
    """
    Get available environments from db.json
    """
    try:
        # Get the path to db.json
        current_dir = os.path.dirname(os.path.abspath(__file__))
        db_json_path = os.path.join(current_dir, "..", "db.json")
        
        # Read db.json
        with open(db_json_path, "r") as file:
            environments = json.load(file)
        
        return {
            "environments": environments,
            "region_mapping": {
                "IND": ["dev", "qa", "qaperf"],
                "US": ["stage", "sup", "prod"]
            }
        }
        
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Environments configuration file not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load environments: {str(e)}"
        )

@router.get("/user-environments")
async def get_user_environments(current_user: dict = Depends(verify_token)):
    """
    Get environments available for the current user based on their region
    """
    try:
        region = current_user.get("region")
        
        # Get all environments
        current_dir = os.path.dirname(os.path.abspath(__file__))
        db_json_path = os.path.join(current_dir, "..", "db.json")
        
        with open(db_json_path, "r") as file:
            all_environments = json.load(file)
        
        # Filter environments based on region
        region_mapping = {
            "IND": ["dev", "qa", "qaperf"],
            "US": ["stage", "sup", "prod"]
        }
        
        available_env_keys = region_mapping.get(region, [])
        user_environments = {
            key: all_environments[key] 
            for key in available_env_keys 
            if key in all_environments
        }
        
        return {
            "region": region,
            "environments": user_environments,
            "available_keys": available_env_keys
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load user environments: {str(e)}"
        )

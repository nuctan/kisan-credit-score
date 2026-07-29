import os
import time
import jwt
import hashlib
import secrets
from db import users_col, in_memory_db
from bson import ObjectId

JWT_SECRET = os.getenv("JWT_SECRET", "krishiai_secret_key_12345")
JWT_ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    """Standard Python PBKDF2-HMAC-SHA256 password hashing with salt"""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${key.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    try:
        if '$' not in hashed:
            return password == hashed
        salt, key_hex = hashed.split('$', 1)
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return secrets.compare_digest(new_key.hex(), key_hex)
    except Exception:
        return False

def generate_token(user_id: str) -> str:
    payload = {
        "id": str(user_id),
        "iat": int(time.time()),
        "exp": int(time.time()) + (30 * 24 * 3600) # 30 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        return None

def find_user_by_email_or_username(identifier: str):
    identifier_clean = identifier.strip().lower()
    
    if users_col is not None:
        user = users_col.find_one({
            "$or": [
                {"email": {"$regex": f"^{identifier_clean}$", "$options": "i"}},
                {"username": {"$regex": f"^{identifier_clean}$", "$options": "i"}}
            ]
        })
        if user:
            user["_id"] = str(user["_id"])
            return user
    else:
        for u in in_memory_db["users"].values():
            if u.get("email", "").lower() == identifier_clean or u.get("username", "").lower() == identifier_clean:
                return u
    return None

def register_user_python(name: str, email: str, password: str, username: str = "", phone: str = ""):
    email_clean = email.strip().lower()
    username_clean = username.strip().lower() if username else email_clean.split("@")[0]

    existing = find_user_by_email_or_username(email_clean)
    if existing:
        return {"error": "इस ईमेल से खाता पहले से मौजूद है (Email already registered)"}

    hashed = hash_password(password)

    user_doc = {
        "name": name,
        "username": username_clean,
        "email": email_clean,
        "password": hashed,
        "phone": phone or "",
        "role": "farmer",
        "farmProfile": {
            "state": "Maharashtra",
            "district": "",
            "crop": "",
            "areaHectares": 0,
            "loanTenureYears": 1,
            "startMonthIndex": 10,
            "cropDurationMonths": 4,
            "suggestedLoanLimit": 0
        }
    }

    if users_col is not None:
        res = users_col.insert_one(user_doc)
        user_id = str(res.inserted_id)
    else:
        user_id = f"user_{int(time.time())}"
        user_doc["_id"] = user_id
        in_memory_db["users"][username_clean] = user_doc

    token = generate_token(user_id)
    return {
        "_id": user_id,
        "name": name,
        "email": email_clean,
        "username": username_clean,
        "role": "farmer",
        "farmProfile": user_doc["farmProfile"],
        "token": token
    }

def login_user_python(identifier: str, password: str):
    user = find_user_by_email_or_username(identifier)
    
    if not user and identifier.strip().lower() in ["admin", "admin@krishiai.com"] and password == "admin":
        # Auto-seed admin user on the fly
        admin_doc = register_user_python("Admin", "admin@krishiai.com", "admin", "admin")
        return admin_doc

    if not user:
        return {"error": "अमान्य उपयोगकर्ता नाम या पासवर्ड (Invalid username or password)"}

    if not verify_password(password, user["password"]):
        return {"error": "अमान्य उपयोगकर्ता नाम या पासवर्ड (Invalid password)"}

    user_id = str(user.get("_id", "admin_id"))
    token = generate_token(user_id)

    return {
        "_id": user_id,
        "name": user.get("name", "User"),
        "email": user.get("email", ""),
        "username": user.get("username", ""),
        "role": user.get("role", "farmer"),
        "farmProfile": user.get("farmProfile", {}),
        "token": token
    }

def get_user_profile_python(user_id: str):
    if users_col is not None:
        try:
            user = users_col.find_one({"_id": ObjectId(user_id)})
            if user:
                user["_id"] = str(user["_id"])
                user.pop("password", None)
                return user
        except Exception:
            pass
        user = users_col.find_one({"username": user_id})
        if user:
            user["_id"] = str(user["_id"])
            user.pop("password", None)
            return user
    else:
        for u in in_memory_db["users"].values():
            if str(u.get("_id")) == user_id or u.get("username") == user_id:
                u_copy = dict(u)
                u_copy.pop("password", None)
                return u_copy
    return {"error": "User not found"}

def update_farm_profile_python(user_id: str, fp_data: dict):
    farm_profile = {
        "state": fp_data.get("state", "Maharashtra"),
        "district": fp_data.get("district", ""),
        "crop": fp_data.get("crop", ""),
        "areaHectares": float(fp_data.get("areaHectares", 0)),
        "loanTenureYears": int(fp_data.get("loanTenureYears", 1)),
        "startMonthIndex": int(fp_data.get("startMonthIndex", 10)),
        "cropDurationMonths": int(fp_data.get("cropDurationMonths", 4)),
        "suggestedLoanLimit": float(fp_data.get("suggestedLoanLimit", 0))
    }

    if users_col is not None:
        try:
            users_col.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"farmProfile": farm_profile}}
            )
        except Exception:
            users_col.update_one(
                {"username": user_id},
                {"$set": {"farmProfile": farm_profile}}
            )
    else:
        for u in in_memory_db["users"].values():
            if str(u.get("_id")) == user_id or u.get("username") == user_id:
                u["farmProfile"] = farm_profile

    return {"message": "Farm profile saved to Python MongoDB successfully", "farmProfile": farm_profile}

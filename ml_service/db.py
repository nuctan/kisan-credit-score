import os
import pymongo
import hashlib
import secrets

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/kisaanai")

db_client = None
db = None
users_col = None
chats_col = None

# In-memory dictionary fallback store if MongoDB connection fails
in_memory_db = {
    "users": {},
    "chats": {}
}

def hash_pwd(password: str) -> str:
    salt = "admin_salt_12345"
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${key.hex()}"

def init_db():
    global db_client, db, users_col, chats_col
    try:
        # Try MongoDB Atlas or Local MongoDB
        db_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        db_client.server_info() # force connection check
        db = db_client["kisaanai"]
        users_col = db["users"]
        chats_col = db["chats"]
        print("✅ Python PyMongo: Connected to MongoDB successfully!")
    except Exception as e:
        print(f"⚠️ PyMongo Atlas Connection Warning: {e}. Falling back to Local/In-Memory Python Database.")
        try:
            db_client = pymongo.MongoClient("mongodb://127.0.0.1:27017/", serverSelectionTimeoutMS=2000)
            db_client.server_info()
            db = db_client["kisaanai"]
            users_col = db["users"]
            chats_col = db["chats"]
            print("✅ Python PyMongo: Connected to Local MongoDB!")
        except Exception as local_e:
            print(f"ℹ️ PyMongo: Using In-Memory Python Dictionary Store for Zero-Dependency Execution.")
            users_col = None
            chats_col = None

    # Auto-seed Admin User (admin / admin)
    seed_admin_user()

def seed_admin_user():
    hashed = hash_pwd("admin")
    admin_doc = {
        "name": "Admin",
        "username": "admin",
        "email": "admin@krishiai.com",
        "password": hashed,
        "role": "admin",
        "farmProfile": {
            "state": "Maharashtra",
            "district": "Ahilyanagar (Ahmednagar)",
            "crop": "Wheat",
            "areaHectares": 3.37,
            "loanTenureYears": 1,
            "startMonthIndex": 10,
            "cropDurationMonths": 4,
            "suggestedLoanLimit": 353607
        }
    }

    if users_col is not None:
        if not users_col.find_one({"username": "admin"}):
            users_col.insert_one(admin_doc)
            print("👤 Python DB: Admin user seeded successfully (admin/admin)")
    else:
        if "admin" not in in_memory_db["users"]:
            in_memory_db["users"]["admin"] = admin_doc
            print("👤 Python DB: Admin user seeded in Python Memory Store (admin/admin)")

# Initialize Database on import
init_db()

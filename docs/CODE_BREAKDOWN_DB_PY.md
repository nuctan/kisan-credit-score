# Line-by-Line Code Breakdown: `ml_service/db.py`

## File Overview
- **File Location**: `ml_service/db.py`
- **Total Lines**: 82
- **Purpose**: Manages MongoDB connection initialization (`pymongo`), defines local/in-memory fallback databases for zero-dependency execution, handles PBKDF2 password hashing, and seeds the default admin user.

---

## Detailed Line-by-Line Explanation

```python
1: import os
2: import pymongo
3: import hashlib
4: import secrets
```
- **Line 1**: Imports `os` to access system environment variables (e.g. `MONGO_URI`).
- **Line 2**: Imports `pymongo` driver to communicate with MongoDB instance.
- **Line 3**: Imports `hashlib` for cryptographic SHA-256 hashing.
- **Line 4**: Imports `secrets` for cryptographically secure random salt generation.

---

### Module State Initialization (Lines 6-17)

```python
6: MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/kisaanai")
```
- **Line 6**: Reads `MONGO_URI` from `.env` file; defaults to local MongoDB (`127.0.0.1:27017/kisaanai`).

```python
8: db_client = None
9: db = None
10: users_col = None
11: chats_col = None
```
- **Lines 8–11**: Initializes global pointer variables for MongoDB client, database handle, `users` collection, and `chats` collection to `None`.

```python
13: # In-memory dictionary fallback store if MongoDB connection fails
14: in_memory_db = {
15:     "users": {},
16:     "chats": {}
17: }
```
- **Lines 14–17**: Defines an **In-Memory Python Dictionary Store**. If local MongoDB or Atlas is unreachable, the application degrades gracefully to this dictionary so the backend never crashes.

---

### Function 1: `hash_pwd` (Lines 19-22)

```python
19: def hash_pwd(password: str) -> str:
20:     salt = "admin_salt_12345"
21:     key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
22:     return f"{salt}${key.hex()}"
```
- **Line 19**: Helper function to hash default admin password.
- **Line 20**: Sets static salt string for administrative user.
- **Line 21**: Executes PBKDF2 key derivation using HMAC-SHA256 with 100,000 iterations.
- **Line 22**: Formats hashed output as `salt$hash_hex`.

---

### Function 2: `init_db` (Lines 24-49) — Resilience & Connection Manager

```python
24: def init_db():
25:     global db_client, db, users_col, chats_col
26:     try:
27:         # Try MongoDB Atlas or Local MongoDB
28:         db_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
29:         db_client.server_info() # force connection check
30:         db = db_client["kisaanai"]
31:         users_col = db["users"]
32:         chats_col = db["chats"]
33:         print("✅ Python PyMongo: Connected to MongoDB successfully!")
```
- **Line 25**: Declares intent to modify global database pointers.
- **Line 28**: Attempts connection to configured `MONGO_URI` with a strict 3-second timeout (`serverSelectionTimeoutMS=3000`).
- **Line 29**: Calls `.server_info()` to force an immediate ping check.
- **Lines 30–33**: Sets database `kisaanai` and collections `users` and `chats`.

```python
34:     except Exception as e:
35:         print(f"⚠️ PyMongo Atlas Connection Warning: {e}. Falling back to Local/In-Memory Python Database.")
36:         try:
37:             db_client = pymongo.MongoClient("mongodb://127.0.0.1:27017/", serverSelectionTimeoutMS=2000)
38:             db_client.server_info()
39:             db = db_client["kisaanai"]
40:             users_col = db["users"]
41:             chats_col = db["chats"]
42:             print("✅ Python PyMongo: Connected to Local MongoDB!")
```
- **Lines 34–42**: Catch block for Atlas failures. Retries connection to local MongoDB (`127.0.0.1:27017`).

```python
43:         except Exception as local_e:
44:             print(f"ℹ️ PyMongo: Using In-Memory Python Dictionary Store for Zero-Dependency Execution.")
45:             users_col = None
46:             chats_col = None
```
- **Lines 43–46**: If local MongoDB is also unavailable, sets collections to `None`, directing all database calls to `in_memory_db` dictionary store.

```python
48:     # Auto-seed Admin User (admin / admin)
49:     seed_admin_user()
```
- **Line 49**: Triggers automatic admin user creation.

---

### Function 3: `seed_admin_user` (Lines 51-78)

```python
51: def seed_admin_user():
52:     hashed = hash_pwd("admin")
53:     admin_doc = {
54:         "name": "Admin",
55:         "username": "admin",
56:         "email": "admin@krishiai.com",
57:         "password": hashed,
58:         "role": "admin",
59:         "farmProfile": {
60:             "state": "Maharashtra",
61:             "district": "Ahilyanagar (Ahmednagar)",
62:             "crop": "Wheat",
63:             "areaHectares": 3.37,
64:             "loanTenureYears": 1,
65:             "startMonthIndex": 10,
66:             "cropDurationMonths": 4,
67:             "suggestedLoanLimit": 353607
68:         }
69:     }
```
- **Lines 52–69**: Constructs default BSON/Dictionary payload for admin user (`admin` / `admin`) with a prefilled farm profile.

```python
71:     if users_col is not None:
72:         if not users_col.find_one({"username": "admin"}):
73:             users_col.insert_one(admin_doc)
74:             print("👤 Python DB: Admin user seeded successfully (admin/admin)")
75:     else:
76:         if "admin" not in in_memory_db["users"]:
77:             in_memory_db["users"]["admin"] = admin_doc
78:             print("👤 Python DB: Admin user seeded in Python Memory Store (admin/admin)")
```
- **Lines 71–74**: If MongoDB is active, checks if `admin` exists; if not, inserts `admin_doc`.
- **Lines 75–78**: If using In-Memory dictionary store, seeds `admin_doc` into `in_memory_db["users"]`.

```python
81: init_db()
```
- **Line 81**: Automatically executes `init_db()` upon module import.

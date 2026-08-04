# Line-by-Line Code Breakdown: `ml_service/auth.py`

## File Overview
- **File Location**: `ml_service/auth.py`
- **Total Lines**: 189
- **Purpose**: Manages user registration, login, PBKDF2-HMAC-SHA256 password hashing with salt, 30-day JSON Web Token (JWT) generation & decoding, and farm profile database updates.

---

## Detailed Line-by-Line Explanation

```python
1: import os
2: import time
3: import jwt
4: import hashlib
5: import secrets
6: from db import users_col, in_memory_db
7: from bson import ObjectId
```
- **Lines 1–7**: Imports system utilities, PyJWT library, cryptographic hashing modules, MongoDB ObjectId handler, and imports database collection pointers from `db.py`.

```python
9: JWT_SECRET = os.getenv("JWT_SECRET", "krishiai_secret_key_12345")
10: JWT_ALGORITHM = "HS256"
```
- **Lines 9–10**: Loads secret signing key for JWT tokens and specifies HMAC-SHA256 encryption algorithm (`HS256`).

---

### Cryptographic Password Functions (Lines 12-26)

```python
12: def hash_password(password: str) -> str:
14:     salt = secrets.token_hex(16)
15:     key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
16:     return f"{salt}${key.hex()}"
```
- **Lines 12–16**: **PBKDF2 Password Hashing**:
  Generates a cryptographically secure 16-byte random hex salt (`secrets.token_hex`), derives key using HMAC-SHA256 across **100,000 iterations**, and formats string as `salt$hash_hex`.

```python
18: def verify_password(password: str, hashed: str) -> bool:
22:     salt, key_hex = hashed.split('$', 1)
23:     new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
24:     return secrets.compare_digest(new_key.hex(), key_hex)
```
- **Lines 18–26**: Re-hashes plain input password using extracted salt and compares derived hash using constant-time string comparison (`secrets.compare_digest`) to prevent timing attacks.

---

### JWT Token Management (Lines 28-41)

```python
28: def generate_token(user_id: str) -> str:
29:     payload = {
30:         "id": str(user_id),
31:         "iat": int(time.time()),
32:         "exp": int(time.time()) + (30 * 24 * 3600) # 30 days
33:     }
34:     return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
```
- **Lines 28–34**: Creates signed JWT payload storing user ID, issued-at timestamp (`iat`), and expiration set for 30 days (`exp`).

```python
36: def decode_token(token: str) -> dict:
38:     payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
39:     return payload
```
- **Lines 36–41**: Validates and decodes incoming Bearer JWT header token; returns `None` if tampered or expired.

---

### User Lookup & Auth Controllers (Lines 43-100)

```python
43: def find_user_by_email_or_username(identifier: str):
47:     user = users_col.find_one({
48:         "$or": [
49:             {"email": {"$regex": f"^{identifier_clean}$", "$options": "i"}},
50:             {"username": {"$regex": f"^{identifier_clean}$", "$options": "i"}}
51:         ]
52:     })
```
- **Lines 43–60**: Queries MongoDB `users` collection (or `in_memory_db["users"]` fallback) case-insensitively using regex matching email or username.

```python
62: def register_user_python(name: str, email: str, password: str, username: str = "", phone: str = ""):
70:     hashed = hash_password(password)
72:     user_doc = {
73:         "name": name, "username": username_clean, "email": email_clean,
76:         "password": hashed, "role": "farmer",
79:         "farmProfile": { "state": "Maharashtra", "district": "", "crop": "", "areaHectares": 0 }
89:     }
92:     res = users_col.insert_one(user_doc)
99:     token = generate_token(user_id)
```
- **Lines 62–100**: Handles new user registration, hashes password, initializes empty `farmProfile` document schema, saves to MongoDB/memory, and returns signed JWT token token payload.

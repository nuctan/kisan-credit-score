# Document 5: Tech Stack, Architecture, User Data & Chat Data Access

---

## 5.1 Full System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    BROWSER (React 18 + Vite)                     │
│                                                                  │
│  LandingPage.jsx ──→ Login/Register ──→ Dashboard.jsx            │
│                                             │                    │
│                     ┌───────────────────────┼──────────────────┐ │
│                     │         │             │           │      │ │
│               FarmlandMap  SatelliteTrend  LandAnalysis  Chat  │ │
│               (Leaflet)    Chart           Card         Widget │ │
│                     └───────────────────────┼──────────────────┘ │
└─────────────────────────────────────────────┼────────────────────┘
                                              │ HTTP (Axios)
                                              ↓
┌──────────────────────────────────────────────────────────────────┐
│              PYTHON FastAPI SERVER (Port 8000)                   │
│                                                                  │
│  /api/auth/register     → auth.py: register_user_python()        │
│  /api/auth/login        → auth.py: login_user_python()           │
│  /api/auth/profile      → auth.py: get_user_profile_python()     │
│  /api/ai/analyze        → main.py: predict_revenue()             │
│  /api/ai/chat           → main.py: chat_with_ai()                │
│  /api/ndvi-weather-trends → trend_analytics.py                   │
│                                                                  │
│  ML Modules: scoring.py, data_loader.py, crop_succession.py      │
│  AI Module:  schemes_rag.py + Groq SDK → LLaMA 3.3 70B           │
│  Satellite:  ndvi_real.py → Sentinel Hub API                     │
└──────────────────────────────┬───────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ↓                     ↓                     ↓
   MongoDB                In-Memory             External APIs
   (kisaanai db)          Python Dict           Sentinel Hub
   users collection       (fallback)            Open-Meteo
   chats collection                             Groq LPU
```

---

## 5.2 Where Is User Data Stored?

### Primary: MongoDB (when running)

**Database name:** `kisaanai`
**Collection name:** `users`

Each user document looks like this:
```json
{
  "_id": "ObjectId(64f3a2b1c8e9d0001a2b3c4d)",
  "name": "Ramesh Patil",
  "username": "ramesh",
  "email": "ramesh@gmail.com",
  "password": "abc123salt$sha256_hashed_string",
  "phone": "9876543210",
  "role": "farmer",
  "farmProfile": {
    "state": "Maharashtra",
    "district": "Nashik",
    "crop": "Wheat",
    "areaHectares": 2.5,
    "loanTenureYears": 1,
    "startMonthIndex": 10,
    "cropDurationMonths": 4,
    "suggestedLoanLimit": 353607
  }
}
```

The `farmProfile` is **automatically saved** after the farmer clicks "Analyze Land" via `PUT /api/auth/profile`.

### Fallback: Python In-Memory Dictionary (when MongoDB is down)

```python
# db.py
in_memory_db = {
    "users": {
        "ramesh": { ...same document as above... }
    },
    "chats": {}
}
```

**Data is lost** when the server restarts in this mode (it's a runtime dictionary, not persistent storage).

---

## 5.3 Where Is Chat Data Stored?

Currently, **chat messages are NOT stored persistently** in this version. Chat history exists only in the React component's `useState` array during the browser session.

The MongoDB `chats` collection and `in_memory_db["chats"]` dictionary are initialized but not actively written to in the current implementation.

**What IS stored:** Only the `chatId` string (a session identifier) is passed back and forth between frontend and backend — it groups messages in a session but does not save the messages themselves.

---

## 5.4 How to Access User Data

### Option A: MongoDB Compass (GUI — easiest)
1. Open **MongoDB Compass** (free download from mongodb.com/products/compass)
2. Connect to: `mongodb://localhost:27017`
3. Open database: **`kisaanai`**
4. Open collection: **`users`**
5. All registered farmers are visible with their farm profiles

### Option B: MongoDB Shell (Terminal)
```bash
mongosh
use kisaanai
db.users.find({}, { password: 0 }).pretty()   # Show all users, hide password
db.users.find({ "farmProfile.crop": "Wheat" }) # Filter by crop
db.users.countDocuments()                      # Total user count
```

### Option C: Python Script (Quick Check)
```bash
cd /home/nuctan/Desktop/kisaanai/ml_service
./venv/bin/python -c "
from db import users_col, in_memory_db
if users_col:
    for u in users_col.find({}, {'password': 0}):
        print(u['name'], u['email'], u.get('farmProfile', {}).get('crop'))
else:
    print('MongoDB not running. In-memory users:')
    for u in in_memory_db['users'].values():
        print(u['name'], u['email'])
"
```

---

## 5.5 Polygon Tile Formula — How Leaflet Calculates Per Tile

This is about how Leaflet decides **which image tile to load** for a given map position.

### The Web Mercator Tile System (XYZ Tiles)

The entire world map is divided into a grid of square image tiles. At zoom level Z, the world is split into $2^Z \times 2^Z$ tiles. Each tile is identified by three numbers: **Z** (zoom), **X** (column), **Y** (row).

### Converting GPS to Tile Numbers

Given a GPS coordinate (latitude $\phi$, longitude $\lambda$) and zoom level $Z$:

$$\text{Tile}_X = \left\lfloor \frac{\lambda + 180}{360} \cdot 2^Z \right\rfloor$$

$$\text{Tile}_Y = \left\lfloor \left(1 - \frac{\ln\left(\tan\phi_r + \sec\phi_r\right)}{\pi}\right) \cdot 2^{Z-1} \right\rfloor$$

Where $\phi_r = \phi \cdot \frac{\pi}{180}$ (latitude in radians) and $\sec\phi_r = \frac{1}{\cos\phi_r}$.

**Example: Nashik farm at (20.01°N, 73.79°E) at zoom level 13:**

$$\text{Tile}_X = \left\lfloor \frac{73.79 + 180}{360} \cdot 2^{13} \right\rfloor = \left\lfloor \frac{253.79}{360} \cdot 8192 \right\rfloor = \left\lfloor 5772.8 \right\rfloor = 5772$$

$$\text{Tile}_Y = \left\lfloor \left(1 - \frac{\ln(\tan(0.3493) + \sec(0.3493))}{\pi}\right) \cdot 4096 \right\rfloor = 3776$$

Leaflet then requests the tile image from:
```
https://server.arcgisonline.com/.../MapServer/tile/13/3776/5772
```

This is why the map URL has `{z}/{y}/{x}` placeholders — Leaflet fills these in dynamically.

### In Our Code (FarmlandMap.jsx)
```jsx
const tileUrl = mapType === 'satellite'
  ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

<TileLayer url={tileUrl} />  // Leaflet handles the formula internally
```

Leaflet handles all the tile math automatically — `{z}`, `{x}`, `{y}` are placeholders that Leaflet fills in based on the current viewport and zoom level.

---

## 5.6 Password Security

Passwords are **never stored as plain text**. We use **PBKDF2-HMAC-SHA256** hashing:

```python
# auth.py — hash_password()
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)        # Random 16-byte salt
    key = hashlib.pbkdf2_hmac(
        'sha256',                       # Hash algorithm
        password.encode('utf-8'),       # Password as bytes
        salt.encode('utf-8'),           # Salt as bytes
        100000                          # 100,000 iterations (slow by design)
    )
    return f"{salt}${key.hex()}"        # Store: "salt$hashed_key"
```

100,000 iterations means even if someone steals the database, it would take years to brute-force a single password.

**JWT Tokens** are used for session authentication:
- Token is generated on login, expires in **30 days**
- Every protected API request includes `Authorization: Bearer <token>` in the header
- Token is decoded server-side to identify the user without database lookup

---

## 5.7 Complete File Reference Map

```
kisaanai/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx        → Bilingual EN/HI landing page
│       │   ├── Login.jsx              → Login form → POST /api/auth/login
│       │   ├── Register.jsx           → Register form → POST /api/auth/register
│       │   └── Dashboard.jsx          → Main page: map + cards + chatbot
│       ├── components/
│       │   ├── FarmlandMap.jsx        → Leaflet + Esri map + polygon + area calc
│       │   ├── SatelliteTrendChart.jsx → 12-month NDVI + rainfall bar chart
│       │   ├── LandAnalysisCard.jsx   → NDVI / weather / soil / yield card
│       │   ├── CalculationBreakdown.jsx → 4-step loan formula transparency
│       │   ├── FullLandReport.jsx     → Multi-year succession + next crop
│       │   ├── FinancialRevenueCard.jsx → Final credit cap card
│       │   └── PDFReportButton.jsx    → Generate bank PDF report
│       └── utils/
│           ├── translations.js        → Full EN/HI bilingual dictionary
│           └── indiaDistricts.js      → Maharashtra 36 district GPS coords
│
└── ml_service/
    ├── main.py             → FastAPI server, all API routes
    ├── auth.py             → Register, login, JWT tokens, profile
    ├── db.py               → MongoDB connection + in-memory fallback
    ├── scoring.py          → NDVI×45% + Weather×35% + Soil×20% formula
    ├── data_loader.py      → CSV yield data + seasonal price prediction
    ├── crop_succession.py  → Multi-year rotation + next sowing decision
    ├── ndvi_real.py        → Sentinel Hub API + 7-day cache
    ├── trend_analytics.py  → 12-month district NDVI + Open-Meteo rainfall
    ├── imd_service.py      → IMD weather data fetching
    ├── schemes_rag.py      → Government schemes knowledge base + retrieval
    ├── ndvi_cache.json     → Cached Sentinel Hub NDVI responses
    └── data/
        ├── Crop Yeild Data(1).csv          → Historical state-crop yield dataset
        └── monthy wheat , mandi price.csv  → Monthly mandi price data
```

---

## 5.8 How to Start the Project

```bash
# Terminal 1 — Start Python ML Backend
cd /home/nuctan/Desktop/kisaanai/ml_service
./venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Start React Frontend
cd /home/nuctan/Desktop/kisaanai/frontend
npm run dev

# Open browser: http://localhost:3000
# Backend API: http://localhost:8000
```

Default login (auto-seeded):
- **Username:** `admin`
- **Password:** `admin`

# 🚀 KisanAI — Production Deployment & Cloud Architecture Guide
> **Master Reference for Project Presentation, Technical Viva, and Cloud Architecture Interviews**  
> **Domain**: `kisancreditai.in` | **Frontend**: Vercel | **Backend**: Render.com | **Database**: MongoDB Atlas Cloud  
> **Team**: Tanishq Kanthed (Lead) · Akshat Srivastava (ML) · Radhika Yadav (UI)

---

## 📖 Table of Contents
1. [The Real Deployment Sequence (How We Went Live)](#1-the-real-deployment-sequence)
2. [Full System Architecture & Data Flow Diagram](#2-full-system-architecture--data-flow-diagram)
3. [Cloud Infrastructure Component Breakdown](#3-cloud-infrastructure-component-breakdown)
4. [Critical Issues Encountered & Solutions](#4-critical-issues-encountered--solutions)
5. [Top 20 Deployment & Viva Interview Questions & Answers](#5-top-20-deployment--viva-interview-questions--answers)

---

## 1. The Real Deployment Sequence

Here is the exact step-by-step chronology of how our team took KisanAI from a local project to a live production web application:

```
[1. Domain Registration]  ──> [2. Cloud DB Setup]      ──> [3. Frontend Deployment]
     BigRock Domain                MongoDB Atlas Cloud            Vercel (React + Vite)
    (kisancreditai.in)            (cluster0.4mhnecz...)           (kisancreditai.in)
                                                                       │
[6. 24/7 Keep-Alive]     <── [5. Backend Deployment]   <──────────────┘
    cron-job.org Pinger           Render.com (FastAPI)            Connect Frontend
   (0 Cold Start Delay)          (kisan-backend-wxsg...)          to Live Backend API
```

### Step-by-Step Summary:
1. **Purchased Custom Domain**: Registered `kisancreditai.in` on BigRock DNS manager.
2. **Provisioned Cloud Database**: Configured a 3-node replica set cluster on **MongoDB Atlas** (AWS Mumbai `ap-south-1` region), whitelisted IP ranges (`0.0.0.0/0`), created database user `kisaanuser`, and initialized the `kisaanai` database collections (`users`, `chats`).
3. **Deployed Frontend UI to Vercel**:
   - Connected GitHub repository `nuctan/kisan-credit-score` to Vercel.
   - Selected **Vite** framework preset with root directory `/frontend`.
   - Linked custom domain `kisancreditai.in` and `www.kisancreditai.in`.
4. **Configured BigRock DNS Routing**:
   - Added **A Record**: `@` pointing to Vercel IP `216.198.79.1`.
   - Added **CNAME Record**: `www` pointing to `4f40f5efa32087a3.vercel-dns-017.com`.
5. **Deployed Python FastAPI Backend to Render.com**:
   - Configured Web Service targeting root directory `/ml_service`.
   - Pinned Python version to `3.10.12` via `.python-version` and `runtime.txt` to enable pre-built wheel installations for Scikit-Learn, Pandas, and PyMongo.
   - Set environment variables (`GROQ_API_KEY`, `MONGO_URI`, `SENTINELHUB_CLIENT_ID`, `SENTINELHUB_CLIENT_SECRET`, `JWT_SECRET`).
   - Assigned live API URL: `https://kisan-backend-wxsg.onrender.com/api`.
6. **Eliminated Cold-Start Delays**:
   - Configured **cron-job.org** to ping `https://kisan-backend-wxsg.onrender.com/docs` every 10 minutes, keeping the Render free instance permanently awake 24/7 with zero latency.

---

## 2. Full System Architecture & Data Flow Diagram

```
                                  +-----------------------+
                                  |    Farmer / User      |
                                  |  kisancreditai.in     |
                                  +-----------+-----------+
                                              |
                                              v
                                  +-----------------------+
                                  |  Vercel Edge Network  |
                                  |  (React + Vite UI)    |
                                  +-----------+-----------+
                                              |
                                              | HTTPS REST API
                                              v
                                  +-----------------------+
                                  |   Render.com Cloud    |
                                  | (FastAPI Python App)  |
                                  +---+-------+-------+---+
                                      |       |       |
           +--------------------------+       |       +--------------------------+
           |                                  |                                  |
           v                                  v                                  v
+--------------------+              +-------------------+              +--------------------+
| MongoDB Atlas DB   |              | Sentinel Hub API  |              | Groq LPU Cloud     |
| (User Profiles,    |              | (Sentinel-2 L2A   |              | (Meta LLaMA 3.3    |
|  Chat History)     |              |  NDVI Imagery)    |              |  70B RAG Model)    |
+--------------------+              +-------------------+              +--------------------+
```

### Complete End-to-End Data Flow Sequence:
1. **User Request**: Farmer visits `https://kisancreditai.in`. Vercel's global CDN serves the optimized React SPA bundle instantly.
2. **Authentication**: Farmer logs in or registers. Vercel sends `POST /api/auth/login` to Render backend. Render verifies PBKDF2-HMAC-SHA256 password hash against MongoDB Atlas `users` collection and issues a 30-day signed **JWT (JSON Web Token)**.
3. **Satellite & ML Credit Analysis**:
   - Farmer enters land details (District: Ahilyanagar, Crop: Wheat, Area: 3.37 Ha, Loan Tenure: 1 Year).
   - React sends `POST /api/ai/analyze` with JWT token.
   - Render calculates harvest-month modal price using **Scikit-Learn Ridge Regression** trained on AGMARKNET mandi data.
   - Render queries **Sentinel Hub API** for real Sentinel-2 satellite red ($B04$) and NIR ($B08$) band surface reflectance values to compute real-time NDVI.
   - Applies **Saaty Analytic Hierarchy Process (AHP)** weighted formula:
     $$\text{Adjusted Revenue} = \text{Base Revenue} \times (0.45 \cdot \text{NDVI} + 0.35 \cdot \text{Weather} + 0.20 \cdot \text{Soil})$$
   - Computes 60% DSCR (Debt Service Coverage Ratio) safe credit cap and returns complete multi-season succession plan.
4. **AI RAG Chat Assistance**:
   - Farmer asks "केसीसी ऋण कैसे आवेदन करें?".
   - Render backend runs local **Keyword Token RAG Scoring** over 7 government scheme knowledge bases.
   - Injects farmer profile + retrieved scheme context into **Groq LLaMA 3.3 70B** model via Groq LPU API.
   - Returns streaming Hindi response back to Vercel UI.

---

## 3. Cloud Infrastructure Component Breakdown

| Component | Provider | Tier | Role & Responsibilities |
|---|---|---|---|
| **Domain** | BigRock | Custom `.in` | Official domain `kisancreditai.in` with DNS A & CNAME records pointing to Vercel edge servers. |
| **Frontend CDN** | Vercel | Hobby (Free) | Hosts the production React 18 + Vite single-page application. Handles SSL/TLS certificate auto-renewal and global edge delivery. |
| **Backend API** | Render.com | Free (Python 3.10) | Hosts the FastAPI web service, executes ML model inference, runs RAG search, and communicates with satellite & LLM APIs. |
| **Database** | MongoDB Atlas | Free (M0 Cluster) | 3-node MongoDB replica set hosted on AWS Mumbai (`ap-south-1`). Persists user accounts, hashed credentials, and chat histories. |
| **Satellite GIS** | Sentinel Hub | Developer API | Provides cloudless Sentinel-2 L2A satellite bands for computing live NDVI vegetation index data. |
| **LLM Inference** | Groq Cloud | Free LPU API | Ultra-low latency LPU hardware running Meta LLaMA 3.3 70B Versatile model for bilingual farmer chat. |
| **24/7 Pinger** | cron-job.org | Free | Sends automated HTTP GET requests every 10 minutes to prevent Render free instance from sleeping. |

---

## 4. Critical Issues Encountered & Solutions

### Issue 1: GitHub Push Protection Blocked Secret API Key
- **Symptom**: `git push origin main` failed with `remote: error: GH013: Repository rule violations found - Push cannot contain secrets`.
- **Root Cause**: The Groq API key string `gsk_...` was present in commit history inside documentation setup guides (`SETUP_GUIDE.md`, `LINUX_SETUP_GUIDE.md`).
- **Solution**: Replaced API key strings with `your_groq_api_key_here` placeholders, committed the fix, and unblocked the secret via GitHub Security settings.

### Issue 2: Render C++ Compilation Failure on Python 3.14
- **Symptom**: Render deployment failed during `pip install -r requirements.txt` with `FAILED: pandas/_libs/window/aggregations.pyx.cpp.o`.
- **Root Cause**: Render defaulted to Python 3.14 (unreleased experimental version), which lacked pre-built binary wheel files for Pandas and Scikit-Learn, forcing pip to compile from C++ source code.
- **Solution**: Created `.python-version` and `runtime.txt` specifying `3.10.12` in root and `ml_service/` directories. Render downloaded instant pre-built binary wheels for Python 3.10.

### Issue 3: React Black Screen / Blank UI After Login
- **Symptom**: Logging in as `admin/admin` resulted in a blank/black screen in browser.
- **Root Cause**: `localStorage.getItem('user')` occasionally contained invalid JSON or string `'undefined'`, causing `JSON.parse()` to throw an unhandled `SyntaxError` that crashed the React component tree.
- **Solution**: Wrapped the root application with a React **`ErrorBoundary`** component and added `try...catch` blocks around all `localStorage` reads in `App.jsx` and `Dashboard.jsx`.

### Issue 4: MongoDB Atlas Port 27017 ISP Blocking
- **Symptom**: Backend startup warning `ServerSelectionTimeoutError: No replica set members found yet`.
- **Root Cause**: Certain local Wi-Fi networks/ISPs block outbound TCP port 27017 used by MongoDB driver.
- **Solution**: Switched connection to mobile network / production environment where outbound TCP 27017 is open, while ensuring the backend gracefully falls back to an in-memory dictionary store if database connection drops.

---

## 5. Top 20 Deployment & Viva Interview Questions & Answers

### Q1: What architecture pattern does KisanAI follow?
**Answer**: KisanAI follows a modern **decoupled micro-service client-server architecture**:
- **Client Tier**: Single Page Application (SPA) built with React 18 + Vite, deployed on **Vercel Edge Network**.
- **Server Tier**: RESTful API microservice built with **FastAPI (Python 3.10)**, deployed on **Render.com**.
- **Database Tier**: Document database hosted on **MongoDB Atlas Cloud**.
- **Third-Party AI/GIS Services**: Groq LPU Cloud (LLaMA 3.3 70B) and Sentinel Hub (Sentinel-2 satellite imagery).

### Q2: Why did you choose Vercel for Frontend and Render for Backend instead of hosting both on one server?
**Answer**:
1. **Separation of Concerns**: Static frontend assets (React HTML/JS/CSS) don't need Python execution environments. Vercel specializes in global Content Delivery Network (CDN) edge caching, providing sub-50ms page load times worldwide.
2. **Scalability**: Decoupling allows scaling the FastAPI Python server independently of the frontend UI based on API compute load.
3. **Zero Maintenance**: Both platforms handle automated SSL certificate issuance, branch previews, and continuous deployment from GitHub triggers.

### Q3: What is DNS and how did you configure `kisancreditai.in` on BigRock?
**Answer**: **DNS (Domain Name System)** translates human-readable domain names (`kisancreditai.in`) into IP addresses that computers use to route internet traffic.
We configured two DNS records on BigRock:
1. **A Record (`@`)**: Mapped the root domain `kisancreditai.in` directly to Vercel's edge server IP address (`216.198.79.1`).
2. **CNAME Record (`www`)**: Created an alias for `www.kisancreditai.in` pointing to Vercel's canonical DNS endpoint (`4f40f5efa32087a3.vercel-dns-017.com`).

### Q4: What is CORS and how does KisanAI handle it?
**Answer**: **CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that restricts a webpage on domain A (`kisancreditai.in`) from making AJAX HTTP requests to a backend on domain B (`kisan-backend-wxsg.onrender.com`).
In FastAPI (`ml_service/main.py`), we configured `CORSMiddleware`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows Vercel frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
This sends `Access-Control-Allow-Origin: *` response headers, allowing the React frontend to make cross-origin requests securely.

### Q5: How does authentication work in KisanAI?
**Answer**: KisanAI uses **Stateless JWT (JSON Web Token)** authentication:
1. When a user logs in via `POST /api/auth/login`, the Python backend verifies the password using PBKDF2-HMAC-SHA256.
2. The backend generates a signed JWT payload containing `user_id`, `iat` (issued at), and `exp` (expiry in 30 days) signed with a secret key `JWT_SECRET`.
3. The frontend stores this token in `localStorage` and includes it in the `Authorization: Bearer <token>` HTTP header for subsequent requests (`/api/ai/analyze`, `/api/auth/profile`).

### Q6: What is a "Cold Start" on cloud platforms and how did you solve it?
**Answer**: Free hosting platforms like Render put idle backend containers into a suspended "sleep" state after 15 minutes of inactivity to conserve RAM/CPU resources. When a new request arrives, it takes 30–50 seconds to initialize the Python runtime ("cold start").
**Our Solution**: We set up an automated 24/7 keep-alive job on **cron-job.org** that sends an HTTP GET request to `https://kisan-backend-wxsg.onrender.com/docs` every 10 minutes. This keeps the container permanently active in memory with zero response latency.

### Q7: Why did the Python build fail on Render initially and how was it resolved?
**Answer**: Render defaulted to Python 3.14 (an unreleased experimental release). Because pre-compiled wheel binaries (`.whl`) were not available for Python 3.14 on Linux PyPI, `pip` attempted to compile complex C++ extensions for `pandas` and `scikit-learn` from source using `gcc`/`cython`, causing build failures.
We resolved it by adding `.python-version` and `runtime.txt` specifying **`3.10.12`**. Python 3.10 download pre-built binary wheels instantly, reducing build time from 5 minutes to 25 seconds.

### Q8: How is database fallback implemented if MongoDB Atlas goes down?
**Answer**: In `ml_service/db.py`, the database initialization function uses a dual-level try-except fallback:
```python
try:
    db_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    db_client.server_info() # Active Mongo Atlas Connection
except Exception:
    # Graceful Fallback to Python In-Memory Dictionary Store
    users_col = None
    chats_col = None
```
If MongoDB Atlas is unreachable, `db.py` seamlessly redirects read/write calls to `in_memory_db = {"users": {}, "chats": {}}`. This guarantees **100% system availability** even during network outages.

### Q9: How does the AI Chatbot perform RAG (Retrieval-Augmented Generation)?
**Answer**:
1. **Retrieval**: When a farmer submits a query, `ml_service/schemes_rag.py` executes token-matching scoring across 7 government scheme text documents (PM-KISAN, KCC, PMFBY, etc.).
2. **Context Injection**: The top-scoring scheme snippets, along with the farmer's land profile (crop, district, area, ML loan limit), are injected into a dynamic system prompt.
3. **Generation**: The prompt is sent to **Meta LLaMA 3.3 70B** running on Groq's high-speed LPU (Language Processing Unit) hardware, producing an accurate, non-hallucinated response in clean Hindi or English.

### Q10: What Machine Learning model is used for Mandi Price prediction?
**Answer**: We implemented a **Scikit-Learn Ridge Linear Regression** model (`ml_service/data_loader.py`) trained on historical AGMARKNET monthly wheat modal prices (`monthy wheat , mandi price.csv`).
To account for seasonal market fluctuation, the model predicts price for the harvest month $t_{\text{harvest}} = (t_{\text{sow}} + d) \bmod 12$ by combining the linear trend with a monthly seasonal price multiplier matrix.

### Q11: How is land area measured on the satellite map?
**Answer**: In `FarmlandMap.jsx`, when a farmer draws a polygon field boundary, we calculate the surface area using a spherical geodesic approximation:
$$\text{Area} = \frac{R^2}{2} \sum_{i=1}^{n} (\lambda_{i+1} - \lambda_{i-1}) \sin(\phi_i)$$
Where $\phi$ is latitude, $\lambda$ is longitude, and $R = 6,378,137\text{ meters}$ (Earth radius). The resulting square meters are converted to Hectares ($1\text{ Ha} = 10,000\text{ m}^2$).

### Q12: How is Sentinel-2 NDVI satellite imagery retrieved?
**Answer**: `ml_service/ndvi_real.py` sends an OAuth2 authenticated request to **Sentinel Hub Process API**. It requests red ($B04$) and near-infrared ($B08$) surface reflectance bands for the land bounding box over the last 30 days. It computes:
$$\text{NDVI} = \frac{B08 - B04}{B08 + B04}$$
If satellite imagery is obscured by heavy cloud cover ($\text{NDVI} < 0$), it applies an automated 7-day spatial cache fallback.

### Q13: What is the mathematical basis of the KisanAI Risk Weight Matrix?
**Answer**: The risk score uses **Saaty's Analytic Hierarchy Process (AHP, 1980)** to derive normalized weights for three independent agricultural parameters:
- **NDVI Score ($w_1 = 0.45$)**: Vegetative health & $f_{\text{APAR}}$ biomass production (Monteith, 1977).
- **Weather Score ($w_2 = 0.35$)**: Rainfall & crop evapotranspiration deficit (FAO-56, 1998).
- **Soil Score ($w_3 = 0.20$)**: District soil N-P-K nutrient & pH balance.
$$\text{Adjusted Revenue} = \text{Base Revenue} \times (0.45 \cdot \text{NDVI} + 0.35 \cdot \text{Weather} + 0.20 \cdot \text{Soil})$$

### Q14: How is the maximum safe loan limit calculated?
**Answer**: KisanAI applies the **60% Debt Service Coverage Ratio (DSCR) Rule**:
$$\text{Max Safe Loan Limit} = \text{Total Multi-Season Tenure Revenue} \times 0.60$$
This ensures that the farmer's loan repayment obligation never exceeds 60% of projected net crop income, preventing agricultural debt traps.

### Q15: How does the application handle React runtime errors in production?
**Answer**: In `frontend/src/App.jsx`, we implemented a React **ErrorBoundary** class component that wraps the router. If any unhandled JavaScript exception or corrupted `localStorage` state occurs, `componentDidCatch` catches the error and renders a clean recovery screen with a "Reset & Reload" button, preventing screen blanking.

### Q16: How do Environment Variables protect secrets across Vercel and Render?
**Answer**: Sensitive credentials (`GROQ_API_KEY`, `MONGO_URI`, `JWT_SECRET`, `SENTINELHUB_CLIENT_SECRET`) are never hardcoded in git source code. They are stored securely in Vercel and Render dashboard Environment Variable vaults and loaded dynamically at runtime via `process.env` (Node) and `os.getenv()` (Python).

### Q17: What environment files are included in the repository for new developers?
**Answer**: The repository includes `.env.example` templates showing required environment variable keys without exposing live secret values. Developers copy `.env.example` to `.env` for local setup.

### Q18: What CI/CD automation is configured for KisanAI?
**Answer**: We use **GitHub-triggered Continuous Integration and Continuous Deployment (CI/CD)**:
- Every `git push origin main` automatically triggers a build on Vercel (Frontend) and Render (Backend).
- If tests/build pass, the deployment updates seamlessly with zero downtime.

### Q19: What is the purpose of `TEAM.md` and `CHANGELOG.md` in the project repository?
**Answer**: 
- `TEAM.md`: Documents team member roles and GitHub profile mappings (`nuctan`, `akshat647`, `Radhikaydv-git`).
- `CHANGELOG.md`: Tracks version evolution from v1.0 (baseline full stack) to v3.0 (cloud production release with ML, satellite, RAG, and custom domain).

### Q20: What are the planned future technical enhancements for KisanAI?
**Answer** (As documented in Chapter 10 of `PROJECT_REPORT.md`):
1. **Semantic Vector Embedding RAG**: Replace keyword matching with dense vector embeddings stored in **ChromaDB / Qdrant**.
2. **Multi-Spectral Satellite Indexing**: Expand beyond NDVI by integrating **EVI** (Enhanced Vegetation Index) and **NDWI** (Normalized Difference Water Index).
3. **End-to-End Supervised ML Risk Model**: Train an **XGBoost Regressor** directly on historical agricultural default data.
4. **Model Explainability**: Integrate **SHAP** (SHapley Additive exPlanations) visual feature importance graphs.
5. **Enterprise Containerization**: Package services with Docker and orchestrate on **Kubernetes** with Redis caching and Prometheus monitoring.

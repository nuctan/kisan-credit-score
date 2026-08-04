# KisanAI — Complete Project Dependencies & Requirements Guide

This file provides the complete list of system software, Python backend libraries, and Node.js frontend packages required to run **KisanAI** on any computer (Windows, Linux, macOS).

---

## 🖥️ 1. System Requirements (Prerequisites)

Before installing project packages, make sure your computer has:

| Tool | Minimum Version | Download Link | Purpose |
|---|---|---|---|
| **Python** | `3.10.x` or higher | [python.org](https://www.python.org/downloads/) | Runs the FastAPI ML backend |
| **Node.js** | `v18.x` or higher | [nodejs.org](https://nodejs.org/) | Runs the React Vite frontend |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | Clones and updates the project |
| **MongoDB** *(Optional)* | `v6.0` or higher | [mongodb.com](https://www.mongodb.com/try/download/community) | Local user data storage *(App auto-falls back to built-in Python memory database if missing!)* |

---

## 🐍 2. Python Backend Requirements (`ml_service/requirements.txt`)

These libraries are required for the Python FastAPI server, ML telemetry calculations, Sentinel-2 satellite queries, and AI chatbot:

```txt
fastapi==0.110.0
uvicorn==0.28.0
pymongo==4.6.2
pyjwt==2.8.0
groq==0.4.2
pandas==2.2.1
numpy==1.26.4
requests==2.31.0
python-dotenv==1.0.1
sentinelhub==3.10.0
python-dateutil==2.9.0
```

### ⚙️ How to Install Python Backend Dependencies:
Open terminal/PowerShell in the project folder and run:
```bash
cd ml_service
python -m venv venv

# On Windows PowerShell:
.\venv\Scripts\activate

# On Linux / macOS:
source venv/bin/activate

# Install all required packages:
pip install -r requirements.txt
```

---

## 💻 3. Node.js Frontend Requirements (`frontend/package.json`)

These packages power the React 18 user interface, Leaflet satellite map, charts, and voice recognition:

### Production Dependencies (`dependencies`):
- `react` (`^19.2.7`) & `react-dom`: Core UI library framework
- `react-router-dom` (`^7.18.1`): Client-side routing between Login, Register, and Dashboard
- `leaflet` (`^1.9.4`) & `react-leaflet` (`^5.0.0`): Interactive satellite map rendering and polygon area drawing
- `axios` (`^1.18.1`): Async HTTP client connecting frontend to Python FastAPI endpoints
- `framer-motion` (`^12.42.2`): UI card animations and transitions
- `tailwindcss` (`^4.3.3`): Modern styling system

### ⚙️ How to Install Frontend Dependencies:
Open a second terminal window and run:
```bash
cd frontend
npm install
```

---

## ⚡ 4. One-Click Project Launch Summary

Once dependencies are installed, your friend can launch the entire system using:

### On Windows:
Double-click the **`start.bat`** file in the main folder!

### On Linux / Mac:
```bash
chmod +x start.sh
./start.sh
```

### Accessing the App:
- 🌐 Frontend Web UI: `http://localhost:3000`
- 🐍 Backend API: `http://localhost:8000`
- 🔑 Default Login: Username: `admin` | Password: `admin`

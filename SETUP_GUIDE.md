# 🌾 KisanAI — Complete Beginner's Setup Guide (Step-by-Step from Zero)

Welcome to **KisanAI**! Follow this simple step-by-step guide to run the complete KisanAI project on your local computer from scratch.

---

## 📌 STEP 1: Download & Install Prerequisites (One-Time Setup)

Make sure you have these 3 free software tools installed on your computer:

1. **Python 3.10+**: Download from [python.org/downloads](https://www.python.org/downloads/)
   - ⚠️ **CRITICAL FOR WINDOWS**: During installation, **check the box that says "Add Python.exe to PATH"** before clicking Install!
2. **Node.js (v18+)**: Download the "LTS" version from [nodejs.org](https://nodejs.org/)
3. **Git**: Download from [git-scm.com](https://git-scm.com/)

---

## 📥 STEP 2: Get the Code on Your Computer

Open your terminal or PowerShell and run:

```bash
git clone https://github.com/your-username/kisaanai.git
cd kisaanai
```

*(Or if you downloaded the ZIP file, extract it and open terminal inside the extracted `kisaanai` folder).*

---

## 🔑 STEP 3: Create the Environment File (`.env`)

Inside the project, go to the `ml_service` folder and create a new file named **`.env`** (without any extra extension).

Paste these exact keys into `ml_service/.env`:

```env
SENTINELHUB_CLIENT_ID=4fc6b83b-9859-4e80-a479-de24edfec4a4
SENTINELHUB_CLIENT_SECRET=zcVICUW7Dqu8bEV5zWzMHmrFWUKChqFN
GROQ_API_KEY=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
JWT_SECRET=krishiai_secret_key_super_secure_2024
MONGO_URI=mongodb://127.0.0.1:27017/kisaanai
```

---

## 🐍 STEP 4: Install Python Backend Dependencies

### On Windows (PowerShell):
Open PowerShell in the `kisaanai` folder and run:

```powershell
# 1. Enable script permissions on Windows
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 2. Enter ml_service folder
cd ml_service

# 3. Create virtual environment
python -m venv venv

# 4. Activate virtual environment
.\venv\Scripts\activate

# 5. Install all backend packages
pip install -r requirements.txt
```

### On Linux / Mac Terminal:
```bash
cd ml_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 💻 STEP 5: Install React Frontend Dependencies

Open a **SECOND** terminal / PowerShell window, go to the `frontend` folder, and run:

```bash
cd frontend
npm install
```

---

## 🚀 STEP 6: Run the Project!

### 🌟 Option A: One-Click Launcher (Windows)
Inside the `kisaanai` folder, simply **double-click the `start.bat` file**! It will automatically start both backend and frontend together.

### 🌟 Option B: Running Manually (2 Terminals)

#### Terminal 1 (Python ML Backend):
```bash
cd ml_service
# Activate venv first!
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Terminal 2 (React Frontend):
```bash
cd frontend
npm run dev
```

---

## 🌐 STEP 7: Open in Browser

Open Google Chrome or Microsoft Edge and go to:
👉 **`http://localhost:3000`**

### 🔑 Login Credentials:
- **Username**: `admin`
- **Password**: `admin`

---

## 🛠️ Common Troubleshooting Tips

1. **"running scripts is disabled on this system" error on Windows**:
   - Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in PowerShell.

2. **"python not recognized" error**:
   - Re-install Python and check the box **"Add Python to PATH"**.

3. **Do I need MongoDB installed?**:
   - **No!** If MongoDB is not installed, KisanAI automatically falls back to its built-in Python memory database, so it works out-of-the-box with zero setup!

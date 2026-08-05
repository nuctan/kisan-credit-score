# 🪟 KisanAI — Windows Setup & Execution Guide (PowerShell)

Complete step-by-step guide to set up and run **KisanAI** on **Windows 10/11** using PowerShell.

---

## 📌 Prerequisites for Windows (One-Time Installation)

1. **Python 3.10+**: Download from [python.org/downloads](https://www.python.org/downloads/)
   - ⚠️ **CRITICAL**: Check the box that says **"Add Python.exe to PATH"** before clicking Install!
2. **Node.js v18+**: Download LTS installer from [nodejs.org](https://nodejs.org/)
3. **Git for Windows**: Download from [git-scm.com](https://git-scm.com/)

---

## 🚀 Step-by-Step PowerShell Setup

### 1️⃣ Step 1: Open PowerShell
Press `Windows Key`, type **PowerShell**, right-click **Windows PowerShell**, and select **Run as Administrator**.

---

### 2️⃣ Step 2: Clone Repository & Create `.env` File
Run the following commands in PowerShell:

```powershell
# Enable PowerShell Script Execution
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Clone the project repository into Desktop
cd "$HOME\Desktop"
git clone https://github.com/your-username/kisaanai.git
cd kisaanai\ml_service

# Create the .env configuration file automatically
@'
SENTINELHUB_CLIENT_ID=4fc6b83b-9859-4e80-a479-de24edfec4a4
SENTINELHUB_CLIENT_SECRET=zcVICUW7Dqu8bEV5zWzMHmrFWUKChqFN
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=krishiai_secret_key_super_secure_2024
MONGO_URI=mongodb://127.0.0.1:27017/kisaanai
'@ | Out-File -Encoding utf8 .env
```

---

### 3️⃣ Step 3: Install & Start Python ML Backend (PowerShell Window #1)

Run this inside `kisaanai\ml_service`:

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install all required Python packages
pip install -r requirements.txt

# Start FastAPI backend server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*(Keep this PowerShell window open! Backend is live on port 8000).*

---

### 4️⃣ Step 4: Install & Start React Frontend (PowerShell Window #2)

Open a **SECOND** PowerShell window and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd "$HOME\Desktop\kisaanai\frontend"

# Install Node modules
npm install

# Start React Vite frontend server
npm run dev
```
*(Keep this second PowerShell window open! Frontend is live on port 3000).*

---

### 🌐 Step 5: Access the Web App

1. Open **Google Chrome** or **Microsoft Edge**.
2. Go to: 👉 **`http://localhost:3000`**
3. Click **Login** and enter default admin credentials:
   - **Username:** `admin`
   - **Password:** `admin`

---

## 🌟 Daily 1-Click Launchers for Windows

### Option A: Double-Click `start.bat`
Simply double-click the `start.bat` file in the main project folder.

### Option B: Single PowerShell Command
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; cd "$HOME\Desktop\kisaanai"; Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ml_service; .\venv\Scripts\activate; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"; cd frontend; npm run dev
```

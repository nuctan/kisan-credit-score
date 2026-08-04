# 🐧 KisanAI — Linux / macOS Setup & Execution Guide (Bash / Zsh)

Complete step-by-step guide to set up and run **KisanAI** on **Ubuntu, Debian, Fedora, Arch Linux, and macOS**.

---

## 📌 Prerequisites for Linux & Mac (One-Time Installation)

Ensure Python 3.10+, Node.js 18+, and Git are installed:

### On Ubuntu / Debian:
```bash
sudo apt update
sudo apt install python3 python3-venv python3-pip nodejs npm git -y
```

### On Fedora / RHEL:
```bash
sudo dnf install python3 python3-pip nodejs npm git -y
```

### On macOS (using Homebrew):
```bash
brew install python node git
```

---

## 🚀 Step-by-Step Terminal Setup

### 1️⃣ Step 1: Clone Repository & Create `.env` File

Open terminal and run:

```bash
cd ~/Desktop
git clone https://github.com/your-username/kisaanai.git
cd kisaanai/ml_service

# Create .env file automatically
cat << 'EOF' > .env
SENTINELHUB_CLIENT_ID=4fc6b83b-9859-4e80-a479-de24edfec4a4
SENTINELHUB_CLIENT_SECRET=zcVICUW7Dqu8bEV5zWzMHmrFWUKChqFN
GROQ_API_KEY=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
JWT_SECRET=krishiai_secret_key_super_secure_2024
MONGO_URI=mongodb://127.0.0.1:27017/kisaanai
EOF
```

---

### 2️⃣ Step 2: Install & Start Python ML Backend (Terminal Window #1)

Run inside `kisaanai/ml_service`:

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install required Python dependencies
pip install -r requirements.txt

# Start FastAPI backend server
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*(Keep this terminal window open! Backend server is live on port 8000).*

---

### 3️⃣ Step 3: Install & Start React Frontend (Terminal Window #2)

Open a **SECOND** terminal window and run:

```bash
cd ~/Desktop/kisaanai/frontend

# Install Node modules
npm install

# Start React Vite dev server
npm run dev
```
*(Keep this second terminal window open! Frontend is live on port 3000).*

---

### 🌐 Step 4: Access the Web App

1. Open your web browser (Chrome, Firefox, Safari).
2. Go to: 👉 **`http://localhost:3000`**
3. Click **Login** and enter default admin credentials:
   - **Username:** `admin`
   - **Password:** `admin`

---

## 🌟 Daily 1-Command Startup for Linux / Mac

From the `kisaanai` project root folder, simply run:

```bash
chmod +x start.sh
./start.sh
```

`start.sh` automatically launches the Python backend on port 8000 and the React frontend on port 3000 in background jobs, trapping `CTRL+C` for clean shutdown!

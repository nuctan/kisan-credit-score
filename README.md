# 🌾 Kisan Credit AI — How To Start

## ⚡ START THE PROJECT (2 Steps Only)

### Step 1: Open your terminal

### Step 2: Paste this command and press Enter

```
cd /home/nuctan/Desktop/kisaanai && bash start.sh
```

That's it. Done. ✅

---

## 🌐 Open in Browser

After running the command above, open your browser and go to:

```
http://localhost:3000
```

**Login with:**
- Username: `admin`
- Password: `admin`

---

## 🛑 How to Stop

Press `CTRL + C` in the same terminal window.

---

## ⚠️ If You Use Fish Shell (and see errors)

Instead of `bash start.sh`, run:

```fish
fish /home/nuctan/Desktop/kisaanai/start.fish
```

OR run each server manually in 2 separate terminal windows:

**Window 1 (Python Backend):**
```fish
cd /home/nuctan/Desktop/kisaanai/ml_service
./venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Window 2 (React Frontend):**
```fish
cd /home/nuctan/Desktop/kisaanai/frontend
npm run dev
```

Then open browser at `http://localhost:3000`

---

## ❓ Common Issues

| Problem | Fix |
|---|---|
| Browser says "Not Found" at port 8000 | That is normal! Go to **port 3000** instead |
| `uvicorn: command not found` | Use `./venv/bin/python -m uvicorn` |
| `source: Error` in Fish shell | Use `fish start.fish` or `bash start.sh` |
| Login fails | Use username `admin` and password `admin` |

---

## 📌 Port Reference

| Service | URL |
|---|---|
| 🌐 Frontend (React) | http://localhost:3000 |
| 🐍 Backend (Python FastAPI) | http://localhost:8000 |

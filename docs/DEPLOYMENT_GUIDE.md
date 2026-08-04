# 🚀 KisanAI — Production Deployment Guide (Domain + Docker + Jenkins + Kubernetes)

This guide explains how to deploy **KisanAI** using **Docker**, **Kubernetes (K8s)**, **Jenkins (CI/CD)**, and link it to your custom purchased domain (e.g. `kisaanai.com`).

---

## 🏗️ Deployment Architecture Overview

```
[ Your Purchased Domain: kisaanai.com ]
                │
                ▼ (DNS A-Record / CNAME)
        [ Cloudflare / Nginx Ingress Controller ]
                │
         ┌──────┴────────────────────────┐
         │ (Port 80)                     │ (Port 8000)
         ▼                               ▼
 [ Kubernetes Frontend Service ]   [ Kubernetes Backend Service ]
 (React Vite + Nginx Pods)         (FastAPI Python Pods)
         │                               │
         └──────────────┬────────────────┘
                        ▼
           [ Kubernetes MongoDB Pod ]
```

---

## 🛠️ Step 1: Containerization with Docker

We have configured multi-stage Dockerfiles for both services and a single `docker-compose.yml`.

### Test locally using Docker Compose:
```bash
# Build & start all 3 containers (Frontend, Backend, MongoDB)
docker-compose up --build -d

# Verify running containers
docker-compose ps
```

- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8000`

---

## ⚓ Step 2: Kubernetes (K8s) Cluster Setup

The project includes production-ready Kubernetes manifests in the `k8s/` directory.

### 1. Create Secrets for API Keys:
```bash
kubectl create secret generic kisaanai-secrets \
  --from-literal=SENTINELHUB_CLIENT_ID='4fc6b83b-9859-4e80-a479-de24edfec4a4' \
  --from-literal=SENTINELHUB_CLIENT_SECRET='zcVICUW7Dqu8bEV5zWzMHmrFWUKChqFN' \
  --from-literal=GROQ_API_KEY='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' \
  --from-literal=JWT_SECRET='krishiai_secret_key_super_secure_2024'
```

### 2. Apply Deployments to Kubernetes:
```bash
# Deploy MongoDB database with Persistent Volume Claim (PVC)
kubectl apply -f k8s/mongodb-deployment.yaml

# Deploy Python FastAPI backend (2 replicas)
kubectl apply -f k8s/backend-deployment.yaml

# Deploy React Nginx frontend (2 replicas)
kubectl apply -f k8s/frontend-deployment.yaml

# Verify running Pods and Services
kubectl get pods
kubectl get svc
```

---

## 🔄 Step 3: CI/CD Pipeline Automation with Jenkins

The included `Jenkinsfile` automates the complete DevOps lifecycle:

1. **Git Checkout**: Pulls latest code from `main` branch.
2. **Build & Test**: Runs Python syntax checks and React production build tests.
3. **Docker Build**: Creates tag-based Docker images for Frontend & Backend.
4. **Push Registry**: Pushes built images to Docker Hub (`nuctan/kisaanai-frontend:latest`).
5. **K8s Rolling Update**: Executes `kubectl rollout restart` to deploy new changes with zero downtime!

### Jenkins Pipeline Setup:
1. Open Jenkins Dashboard $\rightarrow$ **New Item** $\rightarrow$ **Pipeline**.
2. Under Pipeline Definition, select **Pipeline script from SCM**.
3. Set SCM to **Git** and enter your repository URL.
4. Set Script Path to **`Jenkinsfile`**.
5. Save & click **Build Now**!

---

## 🌐 Step 4: Connecting Your Purchased Domain & SSL Certificate

### 1. Map DNS Records (GoDaddy / Namecheap / Cloudflare):
In your domain registrar DNS settings, add these records pointing to your server's Public IP:

| Type | Host | Value | TTL |
|---|---|---|---|
| **A Record** | `@` | `<YOUR_SERVER_PUBLIC_IP>` | Auto |
| **A Record** | `api` | `<YOUR_SERVER_PUBLIC_IP>` | Auto |
| **CNAME** | `www` | `kisaanai.com` | Auto |

### 2. Enable Free HTTPS / SSL Certificate (Certbot Let's Encrypt):
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d kisaanai.com -d www.kisaanai.com -d api.kisaanai.com
```

Certbot will automatically configure HTTPS SSL certificates and set up auto-renewal! 🔒

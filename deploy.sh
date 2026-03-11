#!/bin/bash
# =============================================================
# CuraSense EC2 Deployment Script
# =============================================================
# Run this on a fresh EC2 instance:
#   - Amazon Linux 2023 (recommended) OR Ubuntu 22.04+
#   - Instance type: t3.xlarge (4 vCPU, 16 GB RAM)
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Prerequisites:
#   - Security group: port 22 (SSH) + port 3000 (frontend)
#   - At least 30 GB EBS storage (gp3)
# =============================================================

set -euo pipefail

echo "============================================="
echo " CuraSense Deployment — EC2 Bootstrap"
echo "============================================="

# --- Detect OS ---
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "$ID"
    else
        echo "unknown"
    fi
}

OS_ID=$(detect_os)
echo "Detected OS: $OS_ID"

# --- 1. Install Docker ---
echo "[1/5] Installing Docker..."
if ! command -v docker &> /dev/null; then
    if [[ "$OS_ID" == "amzn" ]]; then
        # Amazon Linux 2023
        sudo dnf update -y
        sudo dnf install -y docker git
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo usermod -aG docker $USER

        # Install docker-compose plugin
        DOCKER_COMPOSE_VERSION="v2.24.5"
        sudo mkdir -p /usr/local/lib/docker/cli-plugins
        sudo curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
            -o /usr/local/lib/docker/cli-plugins/docker-compose
        sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

    elif [[ "$OS_ID" == "ubuntu" ]]; then
        # Ubuntu 22.04+
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg git
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
            $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
            sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        sudo usermod -aG docker $USER
    else
        echo "ERROR: Unsupported OS '$OS_ID'. Use Amazon Linux 2023 or Ubuntu 22.04+."
        exit 1
    fi

    echo ""
    echo "============================================="
    echo " Docker installed!"
    echo " IMPORTANT: Log out and log back in for"
    echo " docker group permissions to take effect:"
    echo ""
    echo "   exit"
    echo "   ssh -i your-key.pem ec2-user@<ip>"
    echo "   cd curasense-architecture && ./deploy.sh"
    echo "============================================="
    # Check if we can already use docker without re-login
    if ! docker info &> /dev/null 2>&1; then
        echo "Please re-login and re-run this script."
        exit 0
    fi
else
    echo "Docker already installed."
fi

# Verify docker works
docker --version
docker compose version

# --- 2. Clone repository ---
echo "[2/5] Cloning repository..."
DEPLOY_DIR="$(pwd)"

# If we're not already inside the repo, clone it
if [ ! -f "docker-compose.yml" ]; then
    if [ ! -d "curasense-architecture" ]; then
        git clone https://github.com/VaibhavK289/curasense-architecture.git
    fi
    cd curasense-architecture
    DEPLOY_DIR="$(pwd)"
else
    echo "Already inside the repo directory."
    git pull || echo "Git pull failed (maybe local changes), continuing..."
fi

# --- 3. Create .env file ---
echo "[3/5] Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo ""
    echo "============================================="
    echo " ACTION REQUIRED: Edit .env file"
    echo "============================================="
    echo ""
    echo " Run:  nano $DEPLOY_DIR/.env"
    echo ""
    echo " Fill in ALL values:"
    echo "   - GOOGLE_API_KEY"
    echo "   - GEMINI_API_KEY"
    echo "   - GROQ_API_KEY"
    echo "   - TAVILY_API_KEY"
    echo "   - HF_TOKEN"
    echo "   - GOOGLE_CREDENTIALS_BASE64"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - CRON_SECRET"
    echo "   - NEXT_PUBLIC_APP_URL (will be auto-set on next run)"
    echo ""
    echo " Then re-run:  ./deploy.sh"
    echo "============================================="
    exit 0
else
    echo ".env file exists."
fi

# --- 4. Update NEXT_PUBLIC_APP_URL with EC2 public IP ---
echo "[4/5] Detecting EC2 public IP..."

# IMDSv2 requires a token (AWS default since 2024)
EC2_IP=""
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" \
    --connect-timeout 3 2>/dev/null || echo "")

if [ -n "$TOKEN" ]; then
    EC2_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
        http://169.254.169.254/latest/meta-data/public-ipv4 \
        --connect-timeout 3 2>/dev/null || echo "")
fi

if [ -n "$EC2_IP" ]; then
    echo "EC2 Public IP: $EC2_IP"
    # Update NEXT_PUBLIC_APP_URL if it's still the default
    if grep -q "NEXT_PUBLIC_APP_URL=http://localhost:3000" .env; then
        sed -i "s|NEXT_PUBLIC_APP_URL=http://localhost:3000|NEXT_PUBLIC_APP_URL=http://$EC2_IP:3000|" .env
        echo "Updated NEXT_PUBLIC_APP_URL to http://$EC2_IP:3000"
    fi
else
    echo "WARNING: Could not detect EC2 public IP."
    echo "Make sure NEXT_PUBLIC_APP_URL is set correctly in .env"
fi

# --- 5. Build and start all services ---
echo "[5/5] Building and starting containers..."
echo "This will take 15-25 minutes on first build (downloading PyTorch + models)..."
echo ""

docker compose up -d --build 2>&1 | tee /tmp/curasense-build.log

# --- Verify ---
echo ""
echo "Waiting 60 seconds for services to start and pass health checks..."
sleep 60

echo ""
echo "Service status:"
echo "---------------------------------------------"
docker compose ps
echo ""

echo "Health checks:"
echo "---------------------------------------------"
for endpoint in "ml-api:8000/health" "vision-api:8001/ping" "medicine-api:8002/health" "frontend:3000/api/health"; do
    name=$(echo $endpoint | cut -d: -f1)
    url="http://localhost:$(echo $endpoint | cut -d: -f2)"
    status=$(curl -sf -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then
        echo "  $name: OK (200)"
    else
        echo "  $name: NOT READY (HTTP $status) — check: docker compose logs $name"
    fi
done

echo ""
echo "============================================="
echo " Deployment complete!"
echo "============================================="
if [ -n "$EC2_IP" ]; then
    echo " Access CuraSense at: http://$EC2_IP:3000"
else
    echo " Access CuraSense at: http://<your-ec2-ip>:3000"
fi
echo ""
echo " Useful commands:"
echo "   docker compose logs -f          # View all logs"
echo "   docker compose logs -f ml-api   # View specific service"
echo "   docker compose ps               # Check service status"
echo "   docker compose down             # Stop all services"
echo "   docker compose up -d            # Start all services"
echo "   docker compose up -d --build    # Rebuild and restart"
echo ""
echo " Build log saved to: /tmp/curasense-build.log"
echo "============================================="

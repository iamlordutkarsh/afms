#!/usr/bin/env bash
set -euo pipefail

# AFMS — One-command Fly.io deployment
# Usage:  bash deploy-fly.sh
#
# Prerequisites: a free Fly.io account (sign up at https://fly.io/app/sign-up)

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RESET="\033[0m"

echo -e "${BOLD}🚀 AFMS — Fly.io Deployment${RESET}"
echo ""

# ── Check / install flyctl ──
if ! command -v fly &>/dev/null; then
  echo -e "${YELLOW}flyctl not found — installing...${RESET}"
  curl -L https://fly.io/install.sh | sh
  export FLYCTL_INSTALL="$HOME/.fly"
  export PATH="$FLYCTL_INSTALL/bin:$PATH"
fi

# ── Auth ──
echo -e "${BOLD}Step 1:${RESET} Sign in to Fly.io"
if fly auth whoami &>/dev/null; then
  echo "  Already signed in."
else
  fly auth login
fi

# ── App name ──
echo ""
echo -e "${BOLD}Step 2:${RESET} Choose a unique app name"
read -rp "  App name [afms-utkarsh]: " APP_NAME
APP_NAME="${APP_NAME:-afms-utkarsh}"
# Update fly.toml
sed -i.bak "s/^app = .*/app = \"$APP_NAME\"/" fly.toml && rm -f fly.toml.bak

# ── Create app ──
echo ""
echo -e "${BOLD}Step 3:${RESET} Creating app '$APP_NAME'..."
fly apps create "$APP_NAME" --no-deploy || true

# ── Volume ──
echo ""
echo -e "${BOLD}Step 4:${RESET} Creating persistent volume (1GB)..."
fly volumes create afms_data --size 1 --app "$APP_NAME" || true

# ── Secrets ──
echo ""
echo -e "${BOLD}Step 5:${RESET} Setting secrets..."
ADMIN_EMAIL="admin@afms.app"
ADMIN_PASSWORD="ChangeMe@2026"
fly secrets set \
  NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  NEXTAUTH_URL="https://$APP_NAME.fly.dev" \
  SUPERADMIN_EMAIL="$ADMIN_EMAIL" \
  SUPERADMIN_PASSWORD="$ADMIN_PASSWORD" \
  --app "$APP_NAME"

# ── Deploy ──
echo ""
echo -e "${BOLD}Step 6:${RESET} Building + deploying (~2-3 min)..."
fly deploy --app "$APP_NAME"

# ── Done ──
echo ""
echo -e "${GREEN}${BOLD}✅ Deployed successfully!${RESET}"
echo ""
echo "   🌐 URL:      https://$APP_NAME.fly.dev"
echo "   👤 Login:    $ADMIN_EMAIL"
echo "   🔑 Password: $ADMIN_PASSWORD"
echo -e "   ${YELLOW}⚠️  Change the admin password in Settings after first login!${RESET}"
echo ""
echo "   Useful commands:"
echo "     fly logs -a $APP_NAME        # view logs"
echo "     fly ssh console -a $APP_NAME # SSH into the machine"
echo "     fly scale memory 1024 -a $APP_NAME  # upgrade RAM"
echo "     fly status -a $APP_NAME      # check status"
echo ""

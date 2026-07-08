#!/usr/bin/env bash
set -euo pipefail

# AFMS — One-command Fly.io deployment

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
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
  echo "  Already signed in as $(fly auth whoami 2>/dev/null)."
else
  fly auth login
fi

# ── App name (loop until unique) ──
echo ""
while true; do
  echo -e "${BOLD}Step 2:${RESET} Choose a unique app name (lowercase letters, numbers, hyphens)"
  read -rp "  App name [afms-utkarsh]: " APP_NAME
  APP_NAME="${APP_NAME:-afms-utkarsh}"

  echo -e "${BOLD}Step 3:${RESET} Creating app '$APP_NAME'..."
  # Try to create — show errors, don't hide them
  CREATE_OUTPUT=$(fly apps create "$APP_NAME" 2>&1) && {
    echo "  ✓ App created."
    break
  } || {
    # Check if it failed because WE already own it (volume exists etc.)
    if fly info -a "$APP_NAME" &>/dev/null; then
      echo -e "  ${YELLOW}App already exists in your account — continuing with it.${RESET}"
      break
    else
      echo -e "  ${RED}✗ Name '$APP_NAME' is taken or invalid.${RESET}"
      echo -e "  ${RED}  Error: $CREATE_OUTPUT${RESET}"
      echo -e "  ${YELLOW}  Try something more unique (e.g. afms-myorg, funds-app-2024)${RESET}"
      echo ""
    fi
  }
done

# ── Update fly.toml ──
sed -i.bak "s/^app = .*/app = \"$APP_NAME\"/" fly.toml && rm -f fly.toml.bak

# ── Volume ──
echo ""
echo -e "${BOLD}Step 4:${RESET} Creating persistent volume (1GB)..."
VOL_OUTPUT=$(fly volumes create afms_data --size 1 -a "$APP_NAME" 2>&1) && {
  echo "  ✓ Volume created."
} || {
  echo -e "  ${YELLOW}Volume may already exist: $VOL_OUTPUT${RESET}"
  echo "  Continuing..."
}

# ── Secrets ──
echo ""
echo -e "${BOLD}Step 5:${RESET} Setting secrets..."
ADMIN_EMAIL="admin@afms.app"
ADMIN_PASSWORD="ChangeMe@2026"
SECRET=$(openssl rand -base64 32)
fly secrets set \
  NEXTAUTH_SECRET="$SECRET" \
  NEXTAUTH_URL="https://$APP_NAME.fly.dev" \
  SUPERADMIN_EMAIL="$ADMIN_EMAIL" \
  SUPERADMIN_PASSWORD="$ADMIN_PASSWORD" \
  -a "$APP_NAME"
echo "  ✓ Secrets set."

# ── Deploy ──
echo ""
echo -e "${BOLD}Step 6:${RESET} Building + deploying (~2-3 min)..."
fly deploy -a "$APP_NAME"

# ── Done ──
echo ""
echo -e "${GREEN}${BOLD}✅ Deployed successfully!${RESET}"
echo ""
echo "   🌐 URL:      https://$APP_NAME.fly.dev"
echo "   👤 Login:    $ADMIN_EMAIL"
echo "   🔑 Password: $ADMIN_PASSWORD"
echo -e "   ${YELLOW}⚠️  Change the admin password in Settings after first login!${RESET}"
echo ""

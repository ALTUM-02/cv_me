#!/usr/bin/env bash
# Run on the production server from the repo root:  sudo bash deploy/deploy.sh
# Pulls latest code, migrates, rebuilds the frontend, fixes nginx /media 403, restarts services.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RUN_USER="${SUDO_USER:-$(whoami)}"
as_user() { sudo -u "$RUN_USER" -H bash -c "$1"; }

echo "==> Pulling latest code"
as_user "cd '$REPO_DIR' && git pull --ff-only"

echo "==> Backend: install, migrate, collectstatic"
VENV=""
for v in "$REPO_DIR/venv" "$REPO_DIR/.venv" "$REPO_DIR/backend/venv" "$REPO_DIR/backend/.venv" "$REPO_DIR/env"; do
  [ -f "$v/bin/activate" ] && VENV="$v" && break
done
ACTIVATE=""
[ -n "$VENV" ] && ACTIVATE="source '$VENV/bin/activate' &&"
as_user "cd '$REPO_DIR/backend' && $ACTIVATE pip install -q -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput"

echo "==> Fixing media file permissions"
chmod -R a+rX "$REPO_DIR/backend/mediafiles" 2>/dev/null || true
# nginx (www-data) must be able to traverse the parent folders
d="$REPO_DIR/backend/mediafiles"
while [ "$d" != "/" ]; do chmod o+x "$d" 2>/dev/null || true; d="$(dirname "$d")"; done

echo "==> Frontend: build"
as_user "cd '$REPO_DIR/frontend' && npm ci --silent && npm run build"

echo "==> nginx: send /media/profile-photos/ to Django"
CONF="$(grep -lE 'location +/graphql' /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf 2>/dev/null | head -1 || true)"
if [ -n "$CONF" ]; then
  CONF="$(readlink -f "$CONF")"
  if ! grep -q 'profile-photos' "$CONF"; then
    UPSTREAM="$(awk '/location +\/graphql/{f=1} f&&/proxy_pass/{print $2; exit}' "$CONF" | tr -d ';')"
    UPSTREAM="${UPSTREAM%/graphql/}"; UPSTREAM="${UPSTREAM%/graphql}"; UPSTREAM="${UPSTREAM%/}"
    [ -z "$UPSTREAM" ] && UPSTREAM="http://127.0.0.1:8000"
    cp "$CONF" "$CONF.bak.$(date +%s)"
    sed -i "0,/location \+\/graphql/s##location /media/profile-photos/ {\n        proxy_pass $UPSTREAM;\n        proxy_set_header Host \$host;\n        proxy_set_header X-Forwarded-Proto \$scheme;\n    }\n\n    location /graphql#" "$CONF"
    echo "    added /media/profile-photos/ -> $UPSTREAM in $CONF"
  else
    echo "    already configured in $CONF"
  fi
  if ! grep -q 'client_max_body_size' "$CONF"; then
    sed -i "0,/location /s##client_max_body_size 20M;\n\n    location #" "$CONF"
    echo "    set client_max_body_size 20M (uploads were limited to 1 MB)"
  fi
  nginx -t && systemctl reload nginx
else
  echo "    !! nginx site config not found; add the block from deploy/nginx-media.conf manually"
fi

echo "==> Restarting Django (gunicorn)"
SVC="$(systemctl list-units --type=service --all --no-legend | awk '{print $1}' | grep -iE 'gunicorn|cv_me|django' | head -1 || true)"
if [ -n "$SVC" ]; then systemctl restart "$SVC" && echo "    restarted $SVC"; else echo "    !! restart gunicorn manually"; fi

echo "==> Done. Hard-refresh the browser (Ctrl+Shift+R)."

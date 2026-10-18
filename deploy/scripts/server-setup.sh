#!/usr/bin/env bash
#
# One-paste setup for a fresh Linux server (Ubuntu/Debian/RHEL family):
#   bash deploy/scripts/server-setup.sh
#
# Installs Docker Engine + the compose plugin if they are missing, then runs
# the normal deploy:  deploy/scripts/bootstrap.sh
#
set -euo pipefail
cd "$(dirname "$0")/../.."

if [ "$(id -u)" -ne 0 ]; then
  # re-exec through sudo, preserving the environment
  exec sudo -E bash "$0" "$@"
fi

echo "→ Checking Docker…"
if ! command -v docker >/dev/null 2>&1; then
  echo "  Docker not found — installing Docker Engine + compose plugin"
  if command -v apt-get >/dev/null 2>&1; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y ca-certificates curl
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    # same key works for Debian; re-fetch with the detected codename
    . /etc/os-release
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
      https://download.docker.com/linux/${ID} ${VERSION_CODENAME:-stable} stable" \
      > /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
  elif command -v dnf >/dev/null 2>&1; then
    dnf -y install dnf-plugins-core
    dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
  else
    echo "✗ Unsupported distribution — install Docker manually:"
    echo "  https://docs.docker.com/engine/install/"
    exit 1
  fi
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "✗ docker compose plugin still missing after install."
  exit 1
fi

echo "→ Docker ready: $(docker compose version --short)"

# Let this root-run step hand off to the normal (non-root capable) deploy.
sudo -u "${SUDO_USER:-root}" -E bash -c 'bash deploy/scripts/bootstrap.sh' 2>/dev/null \
  || bash deploy/scripts/bootstrap.sh

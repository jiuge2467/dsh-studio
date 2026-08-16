#!/usr/bin/env bash
# install.sh: One-click installer for dsh-mascot-pet on Linux/macOS
set -euo pipefail

PROFILE="${1:-default}"
echo "Installing dsh-mascot-pet plugin to profile: $PROFILE"

if command -v dsh &>/dev/null; then
    dsh plugin --profile "$PROFILE" add dsh-mascot-pet
    echo "dsh-mascot-pet successfully added to profile: $PROFILE"
else
    echo "DSH CLI not found. Please add dsh-mascot-pet to cordis.patch.yml manually."
fi

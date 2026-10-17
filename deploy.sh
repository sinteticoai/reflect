#!/bin/bash
# Deploy Reflect: Vercel builds from GitHub (root dir challenge-05-coaching-conversation-scoring/reflect) on every push to main.
set -euo pipefail
cd ~/projects/health-track
git push origin main

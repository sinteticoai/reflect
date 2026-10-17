#!/bin/bash
# Publish Reflect: GitHub repo (first run only) + Vercel production deploy.
set -euo pipefail
ROOT=~/projects/health-track
APP=$ROOT/challenge-05-coaching-conversation-scoring/reflect
cd "$ROOT"
if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create sinteticoai/reflect --public --source . --remote origin \
    --description "Reflect: AI supervisor for every health-coaching call (eMerge AI Hackathon 2026, Sylvester Challenge 5)"
fi
git push -u origin main
cd "$APP"
[ -d .vercel ] || npx -y vercel@latest link --yes --project reflect
if ! npx -y vercel@latest env ls production 2>/dev/null | grep -q ANTHROPIC_API_KEY; then
  grep '^ANTHROPIC_API_KEY=' .env.local | cut -d= -f2- | tr -d '\n' | npx -y vercel@latest env add ANTHROPIC_API_KEY production
fi
npx -y vercel@latest deploy --prod --yes

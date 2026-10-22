# VIGICONTRAT

Pré-analyse IA des contrats de crédit (prototype du Pitch Day). Contexte du projet : `context.md`.

Application statique React + TypeScript (Vite), publiée sur GitHub Pages :
https://cormieryohann.github.io/LAB-EFB/

```bash
pnpm install
pnpm dev      # serveur de développement : http://localhost:5173/LAB-EFB/
pnpm test     # tests Vitest
pnpm lint     # ESLint
pnpm build    # build de production dans dist/
```

Chaque pull request est vérifiée (lint, tests, build) et chaque push sur `main` est déployé (`.github/workflows/ci-cd.yml`). Dans les paramètres
du dépôt, _Settings > Pages > Source_ doit être réglé sur **GitHub Actions**.

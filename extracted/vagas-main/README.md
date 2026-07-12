# Vagas Agora Oficial

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/desenvolvimento-agiodevs-projects/v0-vagas-agora-oficial)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/eP7Yv1m7Mua)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/desenvolvimento-agiodevs-projects/v0-vagas-agora-oficial](https://vercel.com/desenvolvimento-agiodevs-projects/v0-vagas-agora-oficial)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/eP7Yv1m7Mua](https://v0.app/chat/projects/eP7Yv1m7Mua)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Desenvolvimento local

Requisitos:

- Node.js compatível com Next.js 16;
- npm;
- projeto Supabase configurado;
- credenciais Asaas para testar pagamentos e webhooks.

Instalação:

```bash
npm ci --legacy-peer-deps
cp .env.example .env.local
npm run dev
```

Preencha `.env.local` com valores do seu ambiente. Nunca versione esse arquivo.

## Variáveis de ambiente

| Variável | Escopo | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser e servidor | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser e servidor | Sim |
| `NEXT_PUBLIC_APP_URL` | Callback e URLs públicas | Sim |
| `ASAAS_API_KEY` | Somente servidor | Sim para pagamentos |
| `ASAAS_WEBHOOK_SECRET` | Somente servidor | Sim para webhooks |

## Validação

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
npm run build
```

Ou execute o gate completo:

```bash
npm run check
```

O webhook Asaas falha de forma fechada quando `ASAAS_WEBHOOK_SECRET` não está configurado.

## Rotas de triagem

```text
/api/triagem/config
/api/triagem/trigger
/api/triagem/status/[id]
/api/triagem/vagas/[vagaId]
/api/webhooks/n8n
```

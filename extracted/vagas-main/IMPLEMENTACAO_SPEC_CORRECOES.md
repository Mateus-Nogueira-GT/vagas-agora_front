# Implementação da spec de correções

Data: 12/07/2026

## Implementado

- `GET /api/payment/status` exige usuário autenticado, deriva `userId` da identidade validada e retorna DTO restrito.
- `verifyAuth()` valida o usuário server-side com `supabase.auth.getUser()`.
- O client Supabase SSR é criado por requisição e carrega a sessão por cookies.
- O webhook Asaas falha fechado sem segredo, rejeita assinatura inválida e valida JSON/payload mínimo.
- `ViewProvider` e `useView` foram restaurados e cobertos por teste.
- O filtro de vagas foi padronizado em `localizacao`.
- Foi criado `.env.example`; a documentação explica `.env.local` e o gate de validação.
- As rotas de triagem foram movidas para caminhos diretos.
- Os erros TypeScript foram zerados e `ignoreBuildErrors` removido.
- Next.js, React, jsPDF, ESLint e dependências relacionadas foram atualizados.
- `xlsx` foi substituído por `write-excel-file`.
- ESLint usa flat config compatível com Next.js 16 e bloqueia dependências incorretas de hooks.
- Foram adicionados testes para autenticação, status de pagamento e contexto de visualização.

## Validação local

- ESLint: passou sem erros ou warnings.
- TypeScript: passou sem erros.
- Jest: 5 suítes e 15 testes passaram.
- Build Next.js: passou com verificação de tipos habilitada.
- `npm audit --omit=dev`: zero vulnerabilidades.
- Output do build: rotas de triagem diretas confirmadas.

## Pendência externa

A auditoria e os testes das políticas RLS de `asaas_subscriptions` e `asaas_payments` não puderam ser executados. O conector Supabase respondeu `You do not have permission to perform this action` ao listar tabelas e executar advisors.

Nenhuma migration foi inventada ou aplicada sem confirmar o schema remoto. Para concluir esse item, autorize o projeto Supabase no Codex e execute:

1. inspeção das tabelas e constraints;
2. security/performance advisors;
3. testes com usuário A, usuário B, anônimo e administrador;
4. migration rastreável apenas se as policies estiverem ausentes ou incorretas.

## Fora do escopo solicitado

- rotação/remoção das credenciais presentes no ZIP original;
- implementação da validação do segredo do webhook n8n.

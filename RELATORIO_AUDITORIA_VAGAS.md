# Relatório de auditoria — Vagas Agora

Data da análise: 12/07/2026  
Repositório: `Mateus-Nogueira-GT/vagas-agora_front`  
Commit analisado: `f15afeb` (`main`)

## 1. Resumo executivo

O Vagas Agora é uma plataforma de recrutamento full-stack para três perfis: candidatos, empregadores e administradores. O produto permite cadastro e autenticação, manutenção de currículo, pesquisa e publicação de vagas, candidaturas, dashboards, gestão administrativa, assinatura/pagamentos via Asaas e triagem de candidatos integrada ao n8n.

Apesar do nome do repositório sugerir somente frontend, o pacote contém frontend, rotas backend do Next.js, integração com Supabase, webhooks e migrations SQL.

O projeto ainda não está em condição segura para produção. Foram encontrados problemas críticos de segurança, autorização e integridade do build. O maior risco é a presença de credenciais reais dentro de um ZIP publicado em repositório público. As chaves do Asaas e o segredo do webhook devem ser considerados comprometidos e rotacionados imediatamente.

Resumo da validação:

| Validação | Resultado |
|---|---|
| Instalação (`npm ci --legacy-peer-deps`) | Passou |
| Testes (`npm test -- --runInBand`) | 3 suítes, 9 testes, todos passaram |
| ESLint (`npm run lint`) | Passou com 265 warnings |
| TypeScript (`npx tsc --noEmit`) | Falhou com 69 erros |
| Build sem carregar `env.local` | Falhou por variáveis ausentes |
| Build com variáveis carregadas manualmente | Passou, ignorando erros de tipos |
| Auditoria de dependências de produção | 7 vulnerabilidades: 1 crítica, 4 altas e 2 moderadas |

## 2. Estrutura e finalidade

### Frontend

O frontend usa Next.js 16 App Router, React 19, TypeScript, Tailwind CSS e componentes Radix/shadcn. Existem áreas separadas para:

- candidato: dashboard, currículo, pesquisa de vagas, candidaturas, notificações e configurações;
- empregador: dashboard, vagas, criação/edição de vaga, assinatura, ajuda e configurações;
- administrador: dashboard, candidatos, empregadores, profissões e configurações;
- autenticação: login, cadastro e proteção de rotas no cliente.

Há boa cobertura funcional de telas e estados de loading, mas várias páginas são muito extensas, concentram regra de negócio e UI no mesmo arquivo e possuem dependências incorretas ou ausentes em hooks.

### Backend

O backend está embutido no Next.js por Route Handlers em `app/api`. Ele cobre:

- consulta da identidade autenticada;
- geocoding e cidades;
- status e criação de assinaturas;
- produtos e configurações de suporte;
- visualizações de vagas e currículos;
- webhook do Asaas;
- configuração, disparo, consulta e callback da triagem via n8n.

A persistência e autenticação usam Supabase. Boa parte do acesso a dados também é realizada diretamente do navegador via REST/Supabase, portanto a segurança depende fortemente das políticas RLS do banco. O repositório contém apenas duas migrations e não contém a definição completa do schema e das políticas; não foi possível provar a segurança do banco somente pelo código versionado.

### Integrações

- Supabase: Auth, banco e possivelmente Storage/Realtime.
- Asaas: clientes, assinaturas, pagamentos e webhook.
- n8n: processamento externo de triagem de candidatos.
- Nominatim/OpenStreetMap: geocoding.
- Vercel/v0: origem e deploy indicados pelo README.

## 3. Bugs e vulnerabilidades encontrados

### [Crítico] Credenciais reais publicadas no repositório

O único arquivo versionado é `vagas-main (1).zip`. Dentro dele existe `env.local` com valores reais para Supabase e Asaas, inclusive `ASAAS_API_KEY` e `ASAAS_WEBHOOK_SECRET`.

Impacto: terceiros podem obter as credenciais mesmo que o ZIP seja removido posteriormente, pois ele já está no histórico público. A chave anônima do Supabase pode ser pública por definição, mas a chave de API do Asaas e o segredo do webhook nunca podem ser distribuídos.

Ação imediata:

1. Revogar e gerar uma nova chave no Asaas.
2. Gerar um novo segredo/token de webhook e atualizar Asaas e produção.
3. Remover o ZIP e reescrever o histórico Git para eliminar os segredos antigos.
4. Versionar somente `.env.example`, sem valores.
5. Verificar logs do Asaas e do ambiente de produção para uso indevido desde a publicação.

### [Crítico] Webhook do n8n aceita qualquer segredo

O callback declara que valida `webhook_secret`, mas apenas verifica se o campo foi enviado. A implementação admite explicitamente qualquer valor e não usa a função `timingSafeCompare` importada (`route.ts`, linhas 59–62).

Impacto: qualquer pessoa que conheça ou descubra um `triagem_id` pode enviar resultados falsos, alterar notas, classificações e status das candidaturas.

Correção: armazenar um hash/segredo por execução, comparar em tempo constante, validar schema do payload e garantir que cada candidatura pertence à vaga e à triagem recebidas. Adicionar expiração e proteção contra replay.

### [Alto] Endpoint de status de pagamento sem autenticação/autorização

`GET /api/payment/status` recebe livremente `userId` pela query string e devolve o objeto de assinatura sem autenticar o solicitante (`app/api/payment/status/route.ts`, linhas 4–29).

Impacto: risco de IDOR/BOLA e exposição de dados de assinatura de outros usuários. Se o RLS bloquear a consulta, o endpoint deixa de funcionar; se permitir, pode vazar dados.

Correção: autenticar no servidor, derivar o ID do usuário da sessão validada e nunca aceitar outro `userId` para usuário comum. Acesso administrativo deve ter autorização explícita.

### [Alto] Autenticação server-side confia em `getSession()`

`verifyAuth()` usa `supabase.auth.getSession()` e confia no usuário retornado pelo cookie (`lib/auth/api-auth.ts`, linha 19). Em código server-side sensível, a sessão deve ser validada com o servidor de autenticação usando `getUser()` ou mecanismo equivalente atual.

Impacto: decisões de autorização, como criar assinatura, ficam apoiadas em dados de sessão não revalidados.

Correção: trocar por validação server-side do usuário e separar autenticação de autorização por papel/permissão.

### [Alto] Webhook do Asaas falha de modo aberto

Quando `ASAAS_WEBHOOK_SECRET` não está definido, `verifyWebhookSignature()` aceita qualquer chamada (`app/api/webhooks/asaas/route.ts`, linhas 7–14). O próprio teste automatizado confirma e aceita esse comportamento.

Impacto: uma configuração incompleta em produção permite falsificar eventos de pagamento e ativar assinaturas/verificação de currículo.

Correção: falhar fechado em todos os ambientes que processem dados reais. Se o segredo estiver ausente, responder 500/503 e não alterar dados. Validar também o formato do payload e implementar idempotência/replay protection.

### [Alto] Build mascara 69 erros de TypeScript

`next.config.mjs` define `typescript.ignoreBuildErrors: true` (linhas 6–8). O typecheck separado encontrou 69 erros reais, incluindo propriedades inexistentes, parâmetros incorretos, possíveis valores nulos e imports inválidos.

Impacto: o deploy pode ficar verde mesmo com componentes que falham em runtime e filtros que não funcionam.

Correção: resolver os erros por fluxo, remover `ignoreBuildErrors` e tornar typecheck + testes gates obrigatórios de CI.

### [Alto] `ViewProvider` e `useView` não existem

`components/conditional-layout.tsx` importa dinamicamente `ViewProvider`, e `components/view-switcher.tsx` importa `useView`. Entretanto, `contexts/view-context.tsx` exporta `useSidebar` e `SidebarProvider`, duplicando aparentemente o conteúdo do contexto de sidebar.

Impacto: falha de carregamento/renderização do layout ou do seletor de visualização. O TypeScript detecta o problema, mas o build o ignora.

Correção: restaurar o contexto de visualização correto ou remover o provider e o componente se a funcionalidade não existir mais. Criar teste de renderização do layout autenticado.

### [Médio] Filtro de localização usa duas propriedades diferentes

A interface utiliza `localizacao`, mas a tela e a API consultam `localização`, com acento (`app/candidato/pesquisar-vagas/page.tsx`, linha 191; `lib/api/vagas-api.ts`, linhas 441–443). O typecheck marca essa incompatibilidade.

Impacto: a busca por localização pode não aplicar o filtro esperado ou manter contratos inconsistentes entre tela e serviço.

Correção: padronizar em `localizacao` em tipos, estado e API, com teste cobrindo cidade/estado.

### [Médio] Arquivo de ambiente tem nome incompatível com Next.js

O pacote contém `env.local`, mas o Next.js carrega `.env.local`. O build sem exportar manualmente as variáveis falhou durante a coleta de páginas.

Impacto: instalação local e deploy fora do ambiente já configurado falham de maneira pouco clara.

Correção: não versionar credenciais; criar `.env.example` e documentar que o desenvolvedor deve criar `.env.local`. Validar variáveis apenas de forma lazy nos pontos que dependem delas para não quebrar módulos durante o build.

### [Médio] Árvore de rotas de triagem corrompida/duplicada

As APIs foram gravadas em caminhos recursivos como `/api/triagem/config/app/api/triagem/config/app/api/...`, e o build confirma essas URLs extensas.

Impacto: contratos inesperados, manutenção difícil, possibilidade de frontend apontar para URLs que não existem e exposição acidental de endpoints.

Correção: reorganizar para rotas diretas, por exemplo `/api/triagem/config`, `/api/triagem/trigger`, `/api/triagem/status/[id]` e `/api/webhooks/n8n`, ajustando clientes e testes.

### [Médio] Dependências com vulnerabilidades conhecidas

`npm audit --omit=dev` encontrou:

- 1 vulnerabilidade crítica em `jspdf`;
- vulnerabilidades altas em `next`, `lodash`, `ws` e `xlsx`;
- vulnerabilidades moderadas em `dompurify` e `postcss`;
- `xlsx` não possui correção automática indicada pelo audit.

Correção: atualizar as dependências com correção disponível, executar testes de PDF/exportação e substituir ou isolar `xlsx` se a versão usada continuar sem patch.

### [Baixo/Médio] Qualidade estática degradada

O lint retorna 265 warnings, principalmente imports/variáveis não utilizados e dependências ausentes em hooks. Alguns desses avisos de hooks podem causar closures obsoletas, dados que não atualizam ou requisições com filtros antigos.

Correção: tratar warnings de hooks primeiro, depois remover código morto. Configurar limite de warnings no CI.

## 4. Banco de dados e Supabase

O código acessa diretamente tabelas como `profiles`, `candidatos`, `empresas`, `vagas`, `candidaturas`, `asaas_subscriptions`, `asaas_payments` e tabelas de triagem. Porém, as duas migrations presentes tratam apenas campos adicionais de candidatos/disponibilidade; elas não reproduzem o banco completo.

Riscos não verificáveis sem acesso ao projeto Supabase:

- RLS habilitado em todas as tabelas expostas;
- políticas por proprietário/empresa e políticas administrativas;
- autorização de leitura/escrita em assinaturas e pagamentos;
- constraints, chaves estrangeiras e unicidade;
- índices das consultas mais frequentes;
- políticas de Storage;
- funções ou views com `SECURITY DEFINER`/bypass de RLS.

Antes de produção, deve ser feita uma auditoria do schema real e dos advisors do Supabase. Não é seguro assumir que o frontend ou o uso de uma chave anônima substituem autorização no banco.

## 5. Cobertura de testes

Os nove testes existentes cobrem parte da autenticação, API de vagas e assinatura do webhook Asaas. Eles não cobrem os fluxos mais críticos:

- autenticação e autorização por candidato, empregador e admin;
- criação/edição de vagas;
- candidatura e prevenção de duplicidade;
- status de assinatura e IDOR;
- webhook n8n e tentativa com segredo inválido;
- idempotência dos webhooks;
- filtros de busca;
- renderização do layout autenticado;
- RLS e isolamento entre usuários/empresas.

## 6. Ordem recomendada de correção

1. Rotacionar imediatamente os segredos do Asaas e investigar possível uso indevido.
2. Tirar o ZIP público do histórico e versionar o projeto como arquivos normais.
3. Fechar o webhook n8n e fazer o webhook Asaas falhar fechado.
4. Corrigir autenticação/autorização do endpoint de pagamento.
5. Auditar RLS e schema real do Supabase.
6. Corrigir `ViewProvider`, filtro de localização e os demais erros de TypeScript.
7. Remover `ignoreBuildErrors` e configurar CI com typecheck, lint, testes e build.
8. Atualizar dependências vulneráveis.
9. Reorganizar as rotas de triagem e ampliar testes de integração/E2E.

## 7. Como reproduzir as validações

Após extrair o ZIP e criar corretamente um `.env.local` com credenciais rotacionadas:

```bash
npm ci --legacy-peer-deps
npm test -- --runInBand
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

Não reutilize as credenciais encontradas no ZIP: elas devem ser consideradas comprometidas.

## 8. Limitações desta auditoria

- A análise foi estática e local; não foram usados dados reais nem realizados testes destrutivos.
- O schema remoto, as políticas RLS, os logs do Asaas/n8n e as configurações do deploy não estavam disponíveis.
- O repositório não contém o código diretamente, apenas um ZIP, o que reduz rastreabilidade de autoria e histórico por arquivo.
- O build passou somente ao carregar as variáveis manualmente e porque a configuração ignora erros de TypeScript.

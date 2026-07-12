# Relatório de execução — Mobile-first do Vagas Agora

Data: 12/07/2026  
Branch: `codex/mobile-first-adaptability`  
Código: `extracted/vagas-main`  
Escopo executado: M0, M1, M2, M3 e gates web da M5  
Escopo excluído: M4, conforme solicitação

## Resultado

A base web foi convertida de responsividade parcial para uma fundação mobile-first consistente nos fluxos de candidato, empregador e administração.

## Entregas principais

### Estrutura

- `TabsList` restaurado com o primitivo Radix correto;
- navegação mobile compartilhada e acessível;
- headers específicos para candidato, empregador e admin;
- sidebar desktop escondida em mobile para os três papéis;
- conteúdo mobile sem margem fixa da sidebar;
- safe areas, `viewport-fit=cover` e altura dinâmica com `100dvh`;
- drawer com focus trap, `Escape`, retorno de foco e footer no fluxo;
- modais e alertas limitados ao viewport mobile;
- alvos de toque mínimos de 44 px.

### Candidato

- dashboard, pesquisa, detalhes e candidatura;
- candidaturas e cancelamento;
- currículo, verificação e visualizações;
- configurações, ajuda e notificações;
- paddings progressivos, ações empilhadas e textos longos seguros;
- formulários com `inputMode`, `autocomplete`, `enterKeyHint` e controles de senha acessíveis;
- abas do currículo com scroll horizontal deliberado;
- TOC sticky abaixo do header mobile.

### Empregador

- dashboard e página inicial;
- listagem e detalhes de vagas;
- criação e edição de vaga;
- gestão de candidatos;
- assinatura, configurações e ajuda;
- quatro etapas da vaga com scroll horizontal e alvos tocáveis;
- paginação, filtros, cards, gráficos e modais responsivos;
- formulários preparados para teclado mobile.

### Administração

- header e drawer mobile próprios;
- remoção da margem fixa de 64/256 px em telas pequenas;
- sidebar restrita ao desktop.

### Resiliência encontrada durante os testes

- removida a dependência de uma relação PostgREST inexistente entre `candidatos` e `profiles`;
- candidato e email agora são consultados separadamente;
- falha ao obter email não impede carregar o perfil.

## Harness adicionado

- testes Jest para `TabsList` e navegação mobile;
- Playwright configurado para Chromium e WebKit;
- E2E público em 320×568, 390×844, 430×932 e 768×1024;
- E2E do shell autenticado para candidato, empregador e admin em 390×844;
- verificação de overflow global, controles de 44 px, abertura/fechamento do drawer, `Escape` e retorno de foco.

## Validações aprovadas

### Gate completo

```text
npm run check
✓ ESLint sem warnings
✓ TypeScript
✓ Jest: 7 suítes, 17 testes
✓ Next.js production build: 42 páginas
```

### E2E mobile

```text
npm run test:e2e:mobile -- --project=chromium
✓ 11 testes
```

### Browser interno

- login em 320 px: conteúdo renderizado, sem overlay, botão de 44 px e sem overflow;
- cadastro em 390 px: formulário completo, sem erros de console, botão de 44 px e sem overflow.

## Limitações e bloqueios externos

1. O repositório original contém apenas `vagas-main (1).zip`.
2. Não existem projetos `android/` ou `ios/`, Capacitor, Cordova, Expo ou React Native neste checkout ou no ZIP original.
3. M4 não foi executada, conforme solicitado.
4. Builds físicos, TestFlight, Play Store, rollout e métricas não podem ser operados sem o wrapper e os pipelines das lojas.
5. O download local dos browsers Playwright falhou por falta de espaço em disco (`ENOSPC`). Os testes Chromium usaram o Google Chrome instalado. O projeto WebKit permanece configurado para CI ou para um ambiente com espaço disponível.
6. Os E2E autenticados validam o shell com usuários controlados; jornadas com dados reais, pagamento e arquivos exigem fixtures/ambiente de homologação e credenciais próprias de teste.

## Arquivos centrais

- `components/mobile-navigation.tsx`;
- `components/{candidate,employer,admin}-mobile-header.tsx`;
- `components/conditional-layout.tsx`;
- `components/main-content.tsx`;
- `components/sidebar.tsx`;
- `components/ui/tabs.tsx`;
- `components/ui/dialog.tsx`;
- `components/ui/alert-dialog.tsx`;
- `app/globals.css`;
- `app/layout.tsx`;
- páginas sob `app/candidato` e `app/empregador`;
- `tests/e2e/*.spec.ts`;
- `playwright.config.ts`.

## Próximo gate operacional

Antes de uma nova publicação nas lojas:

1. disponibilizar o wrapper Android/iOS;
2. executar WebKit e dispositivos físicos;
3. testar com contas de homologação e dados realistas;
4. validar a versão em faixa interna/TestFlight;
5. executar rollout gradual com rollback documentado.

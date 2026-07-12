# Plano de implementação — Mobile-first do Vagas Agora

Status: M0–M3 e gates web da M5 executados em 12/07/2026; M4 excluída por solicitação  
Spec de referência: `SPEC_ADAPTABILIDADE_MOBILE_VAGAS.md`  
Estimativa inicial: 7,5 a 16 dias úteis, ajustável após localizar o wrapper Android/iOS

> Registro da execução: consulte `RELATORIO_EXECUCAO_MOBILE_VAGAS.md`. As etapas que dependem do wrapper, dispositivos físicos, lojas e rollout permanecem externas a este checkout.

## 1. Estratégia de entrega

Como existem usuários reais e uma submissão iOS em andamento, a implementação deve ser incremental:

1. preservar compatibilidade com o container atualmente publicado;
2. priorizar correções web que possam ser testadas sem exigir novo binário;
3. evitar mudanças nativas no build que está em aprovação;
4. separar correções que exigem novo binário;
5. liberar primeiro para ambiente interno/fechado;
6. ampliar o rollout somente após observar os fluxos críticos.

Nenhuma fase deve agrupar todos os ajustes em um único PR.

## 2. Marcos

| Marco | Resultado | Prazo estimado | Gate |
|---|---|---:|---|
| M0 | Runtime publicado identificado | 0,5–1 dia | Builds Android/iOS e inventário disponíveis |
| M1 | Navegação e estrutura mobile estabilizadas | 1–2 dias | Abas, shell, safe area e drawer aprovados |
| M2 | Jornada do candidato aprovada | 2–4 dias | Jornada E2E completa em Android e iOS |
| M3 | Jornada do empregador aprovada | 2–4 dias | Jornada E2E completa em Android e iOS |
| M4 | Integrações do container aprovadas | 1–3 dias | Voltar, links, arquivos, sessão e retomada |
| M5 | Release controlado concluído | 1–2 dias | Métricas estáveis e sem blockers |

## 3. Backlog executável

### M0 — Descoberta e baseline

#### MOB-PLAN-001 — Localizar o wrapper das lojas

- identificar repositório, branch e pipeline que geram Android/iOS;
- registrar tecnologia, versões mínimas e URL/origem web;
- identificar se alterações web chegam imediatamente aos usuários;
- confirmar política de cache e atualização;
- confirmar se o admin está disponível no aplicativo.

Saída:

- inventário anexado à spec;
- responsáveis e processo de build documentados;
- build de homologação instalável para Android e iOS.

#### MOB-PLAN-002 — Criar baseline visual e funcional

- capturar telas P0 em 320, 390, 430 e 768 px;
- gravar jornada de candidato e empregador no app atual;
- listar blockers, severidade e rota;
- registrar tempos de carregamento e erros atuais;
- preservar evidências para comparação pós-correção.

Gate M0:

- container localizado;
- ao menos um build Android e um build iOS acessíveis;
- matriz de dispositivos fechada;
- baseline armazenado sem dados pessoais reais.

### M1 — Estrutura e navegação

#### MOB-PLAN-101 — Corrigir `TabsList`

Arquivos iniciais:

- `components/ui/tabs.tsx`;
- `app/candidato/curriculo/page.tsx`;
- `app/empregador/criar-vaga/page.tsx`.

Tarefas:

- restaurar `TabsPrimitive.List`;
- criar testes de renderização e interação;
- adaptar currículo para muitas etapas;
- adaptar criação de vaga para quatro etapas;
- validar preservação dos dados entre etapas.

#### MOB-PLAN-102 — Consolidar shell e safe areas

Arquivos iniciais:

- `components/conditional-layout.tsx`;
- `components/main-content.tsx`;
- `components/sidebar.tsx`;
- headers mobile;
- `app/globals.css`.

Tarefas:

- centralizar constantes visuais;
- aplicar safe areas sem duplicar padding do wrapper;
- usar viewport dinâmico;
- corrigir scroll e largura do conteúdo;
- validar breakpoint entre tablet e desktop.

#### MOB-PLAN-103 — Corrigir drawer e acessibilidade

- semântica de diálogo;
- foco ao abrir/fechar;
- `Escape`, overlay e scroll lock;
- `aria-expanded` e `aria-controls`;
- footer dentro do fluxo;
- alvos de toque mínimos;
- teste com texto ampliado.

#### MOB-PLAN-104 — Decidir admin mobile

- confirmar disponibilidade no container;
- implementar header/layout mobile ou bloquear com mensagem explícita;
- documentar decisão.

Gate M1:

- nenhuma rota autenticada P0 fica sem navegação;
- abas essenciais funcionam;
- zero overflow global entre 320 e 430 px;
- menu completo acessível em 320 × 568 px;
- lint, typecheck, testes e build verdes.

### M2 — Jornada do candidato

#### MOB-PLAN-201 — Autenticação e cadastro

- login, senha visível e recuperação;
- seleção de papel e cadastro completo;
- teclado, autocomplete e validações;
- erros de rede e sessão expirada;
- retomada após background.

#### MOB-PLAN-202 — Pesquisa e candidatura

- dashboard;
- busca e filtros;
- cards e detalhes da vaga;
- candidatura e confirmação;
- prevenção de envio duplicado;
- cancelamento e histórico.

#### MOB-PLAN-203 — Currículo

- criação e edição de todas as seções;
- navegação entre etapas;
- teclado e scroll para erros;
- upload de foto e PDF;
- visualização e compartilhamento;
- preservação de rascunho/estado.

#### MOB-PLAN-204 — Conta e pagamento

- configurações;
- assinatura e status;
- pagamento pendente, sucesso e falha;
- ajuda, notificações e logout;
- retomada segura após abrir provedor externo, se aplicável.

Gate M2:

- candidato consegue cadastrar-se, completar currículo, pesquisar e candidatar-se;
- jornada passa em Android e iOS físicos;
- offline e sessão expirada têm recuperação explícita;
- nenhum dado de formulário é perdido inesperadamente.

### M3 — Jornada do empregador

#### MOB-PLAN-301 — Dashboard e vagas

- dashboard e métricas;
- estados vazio/loading/erro;
- lista, paginação e filtros;
- detalhes da vaga.

#### MOB-PLAN-302 — Criar e editar vaga

- quatro etapas responsivas;
- teclado, selects e validações;
- navegação anterior/próxima;
- preservação dos valores;
- prevenção de envio duplicado.

#### MOB-PLAN-303 — Gestão de candidatos

- lista e busca;
- cards/modais de perfil;
- mudança de etapa/status;
- documentos e currículo;
- ações destrutivas com confirmação.

#### MOB-PLAN-304 — Conta do empregador

- configurações da empresa;
- logo e arquivos;
- assinatura;
- ajuda e logout.

Gate M3:

- empregador consegue cadastrar empresa, criar vaga e gerir candidato;
- jornada passa em Android e iOS físicos;
- modais não extrapolam viewport;
- dados longos não quebram cards ou ações.

### M4 — Container e resiliência

#### MOB-PLAN-401 — Navegação nativa

- botão voltar Android;
- deep links;
- links externos;
- retorno ao app;
- rotas inválidas e sessão expirada.

#### MOB-PLAN-402 — Arquivos e permissões

- câmera/galeria quando aplicável;
- file picker;
- upload de imagem e PDF;
- download, visualização e compartilhamento;
- negação de permissão com instrução recuperável.

#### MOB-PLAN-403 — Ciclo de vida

- background/foreground;
- suspensão durante formulário;
- perda e retorno de rede;
- atualização da WebView;
- compatibilidade entre containers antigos e frontend novo.

#### MOB-PLAN-404 — Observabilidade

- versão web e versão nativa;
- sistema operacional e rota;
- erros de tela branca, upload e navegação;
- métricas de login, candidatura e criação de vaga;
- proteção contra captura de PII e secrets.

Gate M4:

- smoke test aprovado nos builds distribuíveis;
- nenhuma integração crítica depende apenas de teste no browser;
- rollback web e nativo documentados.

### M5 — Regressão e release

#### MOB-PLAN-501 — Gate técnico

Executar:

```bash
npm run lint -- --max-warnings=0
npm run typecheck
npm test -- --runInBand
npm run build
```

Executar também a suíte E2E mobile e a matriz manual da spec.

#### MOB-PLAN-502 — Rollout

1. publicar em homologação;
2. distribuir Android em faixa interna/fechada;
3. distribuir iOS por TestFlight quando disponível;
4. executar smoke test pós-distribuição;
5. liberar para pequena porcentagem de usuários quando a loja permitir;
6. monitorar por pelo menos um ciclo de uso relevante;
7. ampliar gradualmente;
8. interromper rollout se qualquer métrica crítica degradar.

#### MOB-PLAN-503 — Critérios de rollback

Rollback imediato se houver:

- aumento material de falha no login;
- tela branca recorrente;
- perda de sessão em massa;
- falha em candidatura ou criação de vaga;
- duplicidade de pagamento ou registros;
- crash relacionado a navegação, upload ou retomada;
- regressão que impeça uso em versão suportada de Android/iOS.

Gate M5:

- zero blocker P0;
- métricas críticas estáveis;
- suporte informado sobre mudanças e rollback;
- versão final registrada no relatório de release.

## 4. Divisão recomendada de PRs

1. `test/mobile-baseline`: harness e casos de regressão que reproduzem falhas;
2. `fix/mobile-tabs`: componente de abas e fluxos afetados;
3. `fix/mobile-shell`: safe areas, viewport, header e drawer;
4. `fix/mobile-candidate-flows`: jornada de candidato;
5. `fix/mobile-employer-flows`: jornada de empregador;
6. `fix/mobile-admin`: somente se a decisão incluir admin no app;
7. `feat/mobile-observability`: versão, métricas e diagnóstico;
8. mudanças nativas separadas por plataforma quando necessárias.

Cada PR deve incluir testes, screenshots antes/depois e instruções de validação.

## 5. Ordem de execução imediata

1. obter o código ou repositório do wrapper Android/iOS;
2. instalar builds atuais em Android e iPhone de teste;
3. criar testes que exponham o `TabsList` vazio;
4. corrigir abas;
5. implementar safe areas e drawer acessível;
6. validar os quatro fluxos mais críticos: login, pesquisa/candidatura, currículo e criação de vaga;
7. seguir para as jornadas completas;
8. liberar somente após os gates de build e dispositivo.

## 6. Acompanhamento

Para cada tarefa registrar:

- responsável;
- branch/PR;
- rota afetada;
- plataformas testadas;
- dispositivos/viewports;
- evidência antes/depois;
- testes executados;
- risco de compatibilidade com container antigo;
- status: pendente, em andamento, bloqueado ou concluído.

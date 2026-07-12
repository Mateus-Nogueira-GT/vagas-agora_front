# Spec técnica — Correção dos bugs do Vagas Agora

Status: pronta para implementação  
Data: 12/07/2026  
Base analisada: `Mateus-Nogueira-GT/vagas-agora_front`, commit `f15afeb`  
Código local: `extracted/vagas-main`

## 1. Objetivo

Corrigir os bugs e riscos encontrados na auditoria a partir do item **“Endpoint de status de pagamento sem autenticação/autorização”**, elevar os gates de qualidade e deixar os fluxos afetados verificáveis por testes automatizados.

## 2. Escopo

Esta spec inclui:

1. autenticação e autorização do status de pagamento;
2. validação server-side da sessão Supabase;
3. comportamento fail-closed do webhook Asaas;
4. correção dos 69 erros de TypeScript e remoção do bypass de build;
5. restauração do `ViewProvider`/`useView`;
6. padronização do filtro `localizacao`;
7. configuração correta de variáveis de ambiente e inicialização build-safe;
8. reorganização das rotas de triagem;
9. atualização de dependências vulneráveis;
10. redução dos warnings de lint relevantes;
11. ampliação do harness de testes e configuração de CI.

Ficam explicitamente fora do escopo, por solicitação do responsável:

- remoção/rotação das credenciais encontradas no ZIP;
- implementação da validação do segredo do webhook n8n.

> Observação: a reorganização física da rota `/api/webhooks/n8n` está no escopo por fazer parte da correção da árvore de rotas, mas a lógica de autenticação desse webhook não será alterada nesta entrega.

## 3. Resultado esperado

Ao final:

- um usuário autenticado consulta apenas a própria assinatura;
- requisições não autenticadas recebem `401`;
- o backend valida o usuário com Supabase Auth, sem confiar apenas em `getSession()`;
- o webhook Asaas rejeita chamadas se o segredo não estiver configurado ou for inválido;
- o layout autenticado renderiza sem import inexistente;
- a busca por localização usa um único contrato;
- as rotas de triagem respondem nos caminhos documentados;
- `npm test`, `npm run lint`, `npm run typecheck` e `npm run build` passam sem bypass;
- não há vulnerabilidade crítica ou alta com correção disponível no `npm audit --omit=dev`.

## 4. Decisões técnicas

### 4.1 Autenticação server-side

Criar uma factory server-side para Supabase com cookies e usá-la por requisição. A factory não deve manter cliente autenticado globalmente entre requisições.

`verifyAuth()` deve:

1. criar o client server-side;
2. validar o token com `supabase.auth.getUser()`;
3. retornar um tipo discriminado, sem `any`;
4. retornar `authorized: false` quando não houver usuário validado;
5. não usar `user_metadata` como fonte de autorização;
6. consultar papel/permissão em fonte confiável quando uma rota exigir privilégio adicional.

Contrato sugerido:

```ts
type AuthResult =
  | { authorized: true; user: User }
  | { authorized: false; user: null; error: string }
```

Não usar `SUPABASE_SERVICE_ROLE_KEY` no browser nem como atalho para contornar RLS.

### 4.2 Autorização e RLS

As rotas devem derivar o proprietário a partir do usuário validado. RLS continua obrigatória como segunda camada de proteção.

Política esperada para tabelas de assinatura/pagamento:

- candidato pode ler somente linhas cujo `user_id = auth.uid()`;
- administrador só pode ler dados de terceiros por uma política administrativa explícita;
- `TO authenticated` isoladamente não é autorização suficiente;
- qualquer policy de `UPDATE` deve ter `USING` e `WITH CHECK`.

A implementação deve primeiro inspecionar o schema remoto. Se essas políticas não existirem, criar migration rastreável. Não inventar nomes de colunas sem confirmar o schema.

## 5. Requisitos funcionais e critérios de aceite

### RF-01 — Proteger `GET /api/payment/status`

Implementação:

- remover `userId` da query string;
- chamar `verifyAuth()`;
- usar exclusivamente `auth.user.id` na consulta;
- retornar apenas DTO necessário à tela;
- não retornar payload bruto do Asaas ou identificadores internos desnecessários;
- atualizar `app/candidato/curriculo/verificar/page.tsx` para chamar `/api/payment/status` sem `userId`.

Contrato HTTP:

```text
GET /api/payment/status
200 { success: true, isActive: boolean, subscription: SubscriptionSummary | null }
401 { error: "Não autenticado" }
500 { error: "Erro ao verificar status" }
```

Critérios de aceite:

- requisição sem sessão retorna `401`;
- usuário A nunca consegue consultar a assinatura de B;
- qualquer `?userId=...` enviado pelo cliente é ignorado ou rejeitado com `400`;
- a tela de verificação continua exibindo status e pagamentos do usuário atual;
- erros internos não expõem detalhes do provedor.

Testes obrigatórios:

- sem sessão;
- sessão válida sem assinatura;
- sessão válida com assinatura ativa;
- tentativa de IDOR por query string;
- erro do serviço de pagamento.

### RF-02 — Validar a identidade Supabase no servidor

Arquivos principais:

- `lib/auth/api-auth.ts`;
- nova factory server-side em `lib/supabase/server.ts` ou caminho equivalente ao padrão adotado;
- testes de autenticação existentes.

Critérios de aceite:

- `verifyAuth()` usa `getUser()`;
- nenhum fluxo sensível usa `getSession()` como prova final de identidade;
- rotas existentes que chamam `verifyAuth()` continuam funcionando;
- testes cobrem token/cookie ausente, usuário válido e erro do Auth.

### RF-03 — Fazer o webhook Asaas falhar fechado

Implementação:

- se `ASAAS_WEBHOOK_SECRET` estiver ausente, não processar o evento;
- responder `503` ou `500` com mensagem genérica;
- se a assinatura estiver ausente ou inválida, responder `403`;
- validar o formato mínimo do evento antes de acessar `payment` ou `subscription`;
- preservar comparação em tempo constante;
- evitar logar segredo, assinatura completa ou payload sensível;
- manter processamento idempotente por `event/payment.id`, conforme suporte do schema.

Critérios de aceite:

- secret ausente nunca ativa assinatura;
- assinatura inválida nunca grava no banco;
- payload inválido retorna `400`;
- evento válido é processado uma única vez;
- o teste atual que aceita secret ausente deve ser invertido.

### RF-04 — Restaurar o contexto de visualização

Problema: `contexts/view-context.tsx` contém uma cópia do contexto de sidebar, mas consumidores esperam `ViewProvider` e `useView`.

Implementação:

- definir `ViewId` conforme os modos realmente suportados pelo produto;
- exportar `ViewProvider` e `useView` com tipos explícitos;
- `useView` deve lançar erro claro quando usado fora do provider;
- persistência em `localStorage` só deve ser adicionada se já for comportamento esperado;
- manter `SidebarProvider` exclusivamente em `contexts/sidebar-context.tsx`.

Critérios de aceite:

- `ConditionalLayout` renderiza área de candidato e empregador;
- `ViewSwitcher` altera o modo selecionado;
- não há erro de import/export no typecheck;
- teste de componente cobre provider, mudança de view e uso fora do provider.

### RF-05 — Padronizar `localizacao`

Implementação:

- usar somente a propriedade ASCII `localizacao` em `PublicVagasFilters`;
- substituir todas as ocorrências de `localização` em chaves de objeto e acessos TypeScript;
- manter “localização” apenas como texto de interface;
- garantir encoding correto ao montar a query REST;
- conferir também filtros de estado e cidade para evitar dois filtros conflitantes.

Critérios de aceite:

- busca por cidade, estado e texto livre envia o parâmetro correto;
- limpar filtros restaura a consulta inicial;
- paginação preserva filtros;
- nenhum erro TypeScript relacionado às duas grafias permanece.

### RF-06 — Corrigir ambiente e inicialização dos clients

Implementação:

- adicionar `.env.example` apenas com nomes e valores fictícios;
- documentar criação local de `.env.local`;
- manter `.env*` ignorado, exceto `.env.example`;
- adicionar `NEXT_PUBLIC_APP_URL` ao exemplo se continuar necessário;
- validar segredos server-only apenas no código server-side;
- inicializar clients/SDKs server-side de forma lazy, evitando erro na avaliação de módulos durante `next build`;
- não criar fallback silencioso para URL, chave ou segredo ausente.

Critérios de aceite:

- `npm run build` funciona com variáveis válidas no ambiente;
- erro de variável ausente identifica apenas o nome da configuração, nunca valores;
- nenhum segredo usa prefixo `NEXT_PUBLIC_`;
- nenhum arquivo real de ambiente é adicionado ao Git.

### RF-07 — Reorganizar rotas de triagem

Mover os handlers para:

```text
app/api/triagem/config/route.ts
app/api/triagem/trigger/route.ts
app/api/triagem/status/[id]/route.ts
app/api/triagem/vagas/[vagaId]/route.ts
app/api/webhooks/n8n/route.ts
```

Implementação:

- mover, não duplicar, os handlers existentes;
- remover diretórios recursivos antigos;
- manter os contratos já usados por `hooks/use-triagem.ts`;
- garantir que `callback_url` use `NEXT_PUBLIC_APP_URL` validada;
- não alterar nesta entrega a lógica de validação do segredo n8n.

Critérios de aceite:

- as cinco rotas aparecem nos caminhos esperados no output do build;
- nenhuma rota contém `/app/api/` no meio da URL;
- o hook funciona sem mudança de contrato;
- testes validam `404/401/200` conforme cada handler existente.

### RF-08 — Zerar erros de TypeScript

Organizar em lotes revisáveis:

1. imports/exports inexistentes e contextos;
2. contratos de filtros e vagas;
3. nullability no dashboard de candidato;
4. formulário de criação de vaga;
5. tipos de respostas Supabase/PostgREST;
6. admin e gráficos;
7. remoção dos `any` que ocultam contratos críticos.

Depois dos erros zerados:

- remover `typescript.ignoreBuildErrors` de `next.config.mjs`;
- remover a chave `eslint` obsoleta do config do Next 16;
- adicionar script `"typecheck": "tsc --noEmit"`;
- adicionar `"check": "npm run lint && npm run typecheck && npm test -- --runInBand && npm run build"`.

Critérios de aceite:

- zero erros em `npm run typecheck`;
- build não usa `ignoreBuildErrors`;
- nenhuma regressão nos fluxos de candidato, empregador e admin.

### RF-09 — Atualizar dependências vulneráveis

Dependências sinalizadas: `jspdf`, `next`, `xlsx`, `lodash`, `ws`, `dompurify` e `postcss`.

Implementação:

- atualizar Next.js para uma versão estável corrigida compatível com o projeto;
- alinhar `eslint-config-next` com a major do Next.js;
- atualizar React/React DOM para patches compatíveis e seguros;
- atualizar `jspdf` e validar geração de PDF;
- avaliar substituição de `xlsx`, já que o audit não apresentou correção disponível;
- atualizar dependências transitivas pelo lockfile;
- não executar `npm audit fix --force` sem revisar breaking changes.

Critérios de aceite:

- `npm audit --omit=dev` sem vulnerabilidades críticas/altas corrigíveis;
- exportação Excel continua abrindo arquivo válido;
- geração de currículo/PDF continua válida;
- testes, typecheck e build passam após atualização.

### RF-10 — Tratar warnings de lint relevantes

Prioridade:

1. `react-hooks/exhaustive-deps`;
2. handlers/estados declarados mas nunca usados e que indicam feature quebrada;
3. imports e variáveis mortas;
4. `any` em fronteiras de API, pagamento e autenticação.

Não adicionar `eslint-disable` genérico para “zerar” o relatório.

Critérios de aceite:

- zero warning de `react-hooks/exhaustive-deps`;
- zero warning nos arquivos alterados;
- CI executa ESLint com `--max-warnings=0` ao fim da iniciativa.

## 6. Harness de validação

### Testes unitários

- `verifyAuth()` com todos os estados;
- DTO/mapper de assinatura;
- validação de assinatura Asaas;
- contexto de visualização;
- normalização dos filtros de vagas.

### Testes de integração de Route Handlers

- status de pagamento autenticado e não autenticado;
- webhook Asaas: secret ausente, assinatura inválida, payload inválido, evento válido e repetido;
- rotas de triagem nos novos caminhos.

### Testes de RLS

Com fixtures de usuário A, usuário B e admin:

- A lê a própria assinatura;
- A não lê a assinatura de B;
- anônimo não lê assinaturas/pagamentos;
- admin acessa somente se houver policy explícita;
- updates não permitem trocar `user_id`.

### Smoke/E2E

1. login de candidato;
2. abertura do dashboard autenticado;
3. pesquisa de vaga por localização;
4. consulta de status de assinatura;
5. login de empregador e abertura da área de vagas;
6. acesso às telas administrativas com papel autorizado.

## 7. Plano de implementação

### Fase 1 — Segurança e autenticação

- RF-01, RF-02 e RF-03;
- testes de API e RLS;
- entrega isolada e revisável.

### Fase 2 — Bugs funcionais

- RF-04, RF-05 e RF-06;
- testes de componente, filtro e build.

### Fase 3 — Organização e qualidade

- RF-07 e RF-08;
- remoção dos bypasses;
- configuração do gate `check`.

### Fase 4 — Dependências e limpeza

- RF-09 e RF-10;
- auditoria final e smoke/E2E.

Cada fase deve terminar com commit separado e validação completa. Não misturar refactor cosmético com correção de segurança.

## 8. Definition of Done

A iniciativa estará concluída quando:

- todos os RFs desta spec estiverem implementados;
- testes novos demonstrarem as falhas anteriores e passarem após a correção;
- `npm run check` passar;
- o build não ignorar TypeScript ou lint;
- o output do build listar rotas de triagem corretas;
- o audit não apresentar vulnerabilidade crítica/alta corrigível;
- as políticas RLS relevantes tiverem evidência de teste;
- README e `.env.example` documentarem setup e validação;
- nenhuma credencial for adicionada aos arquivos alterados.

## 9. Riscos e cuidados

- A troca de `getSession()` por validação remota pode expor fluxos que dependiam de sessão inválida ou cookies mal configurados.
- Corrigir RLS pode revelar acessos frontend que funcionavam apenas por políticas permissivas.
- Mover rotas quebra callbacks externos se a URL do n8n não for atualizada no ambiente.
- Atualizações de `jspdf`, `xlsx` ou Next.js podem exigir ajustes de API.
- Remover `ignoreBuildErrors` deve ocorrer somente depois de zerar os erros, para manter commits intermediários executáveis.

## 10. Referências técnicas

- Supabase Auth SSR: https://supabase.com/docs/guides/auth/server-side
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Next.js environment variables: https://nextjs.org/docs/app/guides/environment-variables
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers

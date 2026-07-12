# Spec técnica — Adaptabilidade mobile do Vagas Agora

Status: pronta para implementação  
Data: 12/07/2026  
Base web analisada: `extracted/vagas-main`  
Contexto operacional: aplicativo publicado na Play Store, em aprovação na App Store e com usuários reais predominantemente mobile

## 1. Decisão de produto

O Vagas Agora deve adotar **mobile-first como requisito de produção**, e não apenas responsividade complementar ao desktop.

A base atual já contém breakpoints Tailwind, headers mobile para candidato e empregador e layouts fluidos em várias páginas. A entrega, portanto, não exige reescrever o produto em outra tecnologia. Ela exige consolidar um shell mobile confiável, corrigir componentes compartilhados que quebram fluxos essenciais e validar o aplicativo dentro dos containers realmente distribuídos nas lojas.

O checkout analisado não contém projetos `android/` ou `ios/`, nem configuração de Capacitor, Cordova, Expo ou React Native. O wrapper usado nas lojas deve ser localizado antes da validação final. Não se deve inferir seu comportamento a partir do frontend web.

## 2. Objetivo

Garantir que os fluxos principais de candidato e empregador sejam utilizáveis, acessíveis e estáveis em celulares Android e iOS, incluindo:

- telas pequenas e grandes;
- safe areas, notch e barra de navegação;
- teclado virtual;
- orientação retrato e paisagem;
- WebView/container publicado nas lojas;
- navegação por toque e botão voltar;
- conexões lentas, perda de rede e retomada do aplicativo;
- texto ampliado e tecnologias assistivas.

## 3. Escopo

### 3.1 Fluxos P0 — usuários finais

1. login, recuperação de senha e cadastro;
2. navegação mobile de candidato e empregador;
3. dashboard do candidato;
4. pesquisa, filtros e detalhes de vagas;
5. candidatura, confirmação e cancelamento;
6. candidaturas do usuário;
7. criação, edição e visualização do currículo;
8. dashboard do empregador;
9. criação e edição de vaga;
10. listagem de vagas e gestão de candidatos;
11. assinatura, pagamento e verificação;
12. configurações, ajuda e logout.

### 3.2 Fluxos P1

- notificações;
- visualizações de currículo;
- modais extensos de perfil;
- exportação, upload e download de arquivos;
- compartilhamento e abertura de links externos;
- área administrativa, caso seja acessível no aplicativo distribuído.

### 3.3 Fora do escopo

- redesign completo da identidade visual;
- mudança das regras de negócio;
- reescrita imediata em React Native ou Flutter;
- alteração do backend sem relação direta com os fluxos mobile;
- publicação de nova versão nas lojas antes dos gates desta spec.

## 4. Matriz mínima de suporte

### Viewports web

| Classe | Larguras mínimas para teste | Alturas de referência |
|---|---:|---:|
| Android compacto | 320, 360 px | 568, 640 px |
| Android comum | 384, 412 px | 800, 915 px |
| iPhone compacto | 375 px | 667 px |
| iPhone atual | 390, 393 px | 844, 852 px |
| iPhone grande | 430 px | 932 px |
| Tablet | 768, 820 px | 1024, 1180 px |

### Ambientes reais

- Android WebView na menor versão de Android suportada pelo aplicativo publicado;
- Android WebView na versão estável atual;
- WKWebView na menor versão de iOS definida no projeto da App Store;
- WKWebView na versão estável atual de iOS;
- pelo menos um Android de entrada e um iPhone físico;
- retrato como orientação principal e paisagem como teste de resiliência.

As versões mínimas exatas devem ser obtidas dos projetos nativos e das configurações das lojas.

## 5. Requisitos funcionais e critérios de aceite

### MOB-01 — Restaurar o componente compartilhado de abas

Problema: `components/ui/tabs.tsx` define `TabsList`, mas retorna um fragmento vazio. Os seletores de abas não são renderizados, afetando fluxos como currículo e criação de vaga.

Implementação:

- renderizar `TabsPrimitive.List` com `ref`, propriedades e `children`;
- definir estilos-base responsivos no componente compartilhado;
- evitar altura fixa quando as abas quebrarem em mais de uma linha;
- nas telas com muitas etapas, preferir um seletor compacto, stepper ou rolagem horizontal deliberada em vez de dez abas comprimidas;
- manter navegação por teclado e estados ativos do Radix.

Critérios de aceite:

- todas as abas aparecem e podem ser acionadas por toque;
- nenhum rótulo se sobrepõe entre 320 e 430 px;
- a aba ativa é perceptível visualmente e por tecnologia assistiva;
- o conteúdo correto é exibido após troca de aba;
- foco por teclado funciona em browser e WebView;
- currículo e criação de vaga preservam estado ao trocar de etapa.

Testes obrigatórios:

- teste unitário do `TabsList` renderizando filhos;
- teste de troca de aba;
- teste responsivo de currículo em 320 e 390 px;
- teste responsivo de criação de vaga em 320 e 390 px.

### MOB-02 — Consolidar o shell mobile autenticado

Arquivos principais:

- `components/conditional-layout.tsx`;
- `components/main-content.tsx`;
- `components/sidebar.tsx`;
- `components/candidate-mobile-header.tsx`;
- `components/employer-mobile-header.tsx`.

Implementação:

- extrair a estrutura comum dos dois headers sem misturar menus e permissões de cada papel;
- centralizar breakpoint, altura do header, z-index e largura do drawer;
- garantir largura integral do conteúdo abaixo de `lg`;
- substituir dependências frágeis de `100vh` por `100dvh` com fallback quando necessário;
- incorporar `env(safe-area-inset-top)`, `right`, `bottom` e `left`;
- impedir scroll do conteúdo de fundo enquanto o drawer estiver aberto;
- fechar o drawer após navegação, logout, `Escape` e botão voltar do container, quando aplicável;
- preservar o estado da rota ao suspender e retomar o aplicativo.

Critérios de aceite:

- header não fica sob notch ou status bar;
- conteúdo não fica sob o header nem sob a barra inferior do sistema;
- drawer abre e fecha sem deslocamento horizontal da página;
- não existe rolagem horizontal global;
- navegação continua funcional com 200% de zoom ou texto ampliado;
- voltar fecha primeiro o drawer e somente depois sai da rota, quando o wrapper permitir interceptação.

### MOB-03 — Corrigir acessibilidade e ergonomia do menu mobile

Implementação:

- adicionar `aria-expanded` e `aria-controls` ao botão do menu;
- usar semântica adequada de diálogo/drawer;
- mover foco para o drawer ao abrir e devolvê-lo ao botão ao fechar;
- implementar focus trap enquanto aberto;
- fechar com `Escape`;
- tornar o overlay não interativo para leitores de tela;
- remover footer absoluto que possa sobrepor links; usar layout flex com navegação rolável e rodapé no fluxo;
- garantir alvos de toque de pelo menos 44 × 44 px;
- preservar contraste mínimo WCAG AA em estados normal, ativo, erro e desabilitado.

Critérios de aceite:

- menu completo permanece alcançável em 320 × 568 px;
- nenhum item fica escondido atrás do rodapé;
- TalkBack e VoiceOver anunciam estado aberto/fechado e nome dos itens;
- foco não escapa para o conteúdo de fundo;
- todos os controles essenciais têm nome acessível.

### MOB-04 — Adaptar formulários ao teclado virtual

Fluxos prioritários:

- login e cadastro;
- currículo;
- criação e edição de vaga;
- configurações;
- pagamento e assinatura.

Implementação:

- manter inputs com fonte mínima de 16 px no iOS para evitar zoom automático;
- usar tipos e `inputMode` adequados para email, telefone, CEP, moeda e números;
- definir `autocomplete` coerente para autenticação, endereço e dados pessoais;
- garantir que o campo focado e a mensagem de erro permaneçam visíveis com o teclado aberto;
- colocar ações primárias no fluxo, sem footer fixo sobre o teclado;
- manter valores preenchidos ao trocar de aba, perder foco ou suspender o aplicativo;
- permitir envio pelo teclado quando seguro;
- aplicar validação junto ao campo e resumo de erro em formulários longos.

Critérios de aceite:

- teclado não cobre o campo ativo nem o botão necessário para avançar;
- foco avança em ordem lógica;
- nenhum dado é perdido ao alternar entre etapas;
- erros são legíveis e associados ao campo;
- formulários funcionam em retrato e continuam recuperáveis em paisagem.

### MOB-05 — Tornar páginas e componentes realmente mobile-first

Implementação:

- revisar paddings fixos `px-6`, `p-6` e `p-8` nas telas de 320–360 px;
- usar espaçamento menor no mobile e ampliar progressivamente;
- transformar linhas de ações em pilhas ou menus quando não couberem;
- impedir títulos, badges, breadcrumbs e paginação de comprimirem o conteúdo;
- limitar textos longos com quebra segura, sem esconder informação essencial;
- definir `min-width: 0` em filhos flex/grid que contenham texto variável;
- usar cartões ou visualização resumida para tabelas essenciais no mobile;
- usar scroll horizontal apenas quando a comparação tabular for indispensável e sinalizá-lo visualmente.

Critérios de aceite:

- zero overflow horizontal global nas larguras da matriz;
- ações primárias aparecem sem zoom e sem gesto de precisão;
- textos não são cortados ou sobrepostos;
- listas continuam escaneáveis com dados reais e nomes longos;
- modais respeitam viewport, safe areas e teclado.

### MOB-06 — Definir comportamento para loading, erro, offline e retomada

Implementação:

- garantir loading, vazio, erro e retry nos fluxos P0;
- detectar falha de rede e diferenciar de erro de validação ou servidor;
- evitar telas em branco durante retomada da WebView;
- impedir envio duplicado de candidatura, vaga, pagamento e formulários;
- manter botões bloqueados durante operações irreversíveis;
- oferecer retry explícito sem apagar dados locais do formulário;
- validar expiração e restauração da sessão após background/foreground.

Critérios de aceite:

- perda de rede produz mensagem acionável;
- retry não duplica registros;
- retomada do app restaura uma tela válida ou redireciona para login com explicação;
- erros não ficam apenas em logs;
- skeletons não causam grandes saltos de layout.

### MOB-07 — Validar integração com o container Android/iOS

Pré-condição: localizar o repositório ou diretório que gera os binários das lojas.

Inventário obrigatório:

- tecnologia do wrapper;
- URL/origem carregada;
- versões mínimas de Android e iOS;
- regras de navegação e domínios permitidos;
- persistência de cookies/storage;
- deep links e universal/app links;
- botão voltar do Android;
- permissões de câmera, galeria e arquivos;
- download, upload e compartilhamento;
- tratamento de links externos;
- status bar, splash screen e safe areas;
- política de atualização do conteúdo web;
- crash reporting e analytics sem dados sensíveis.

Critérios de aceite:

- login persiste após fechar e reabrir o aplicativo conforme regra do produto;
- links internos permanecem no app e links externos abrem no destino correto;
- botão voltar não fecha o aplicativo inesperadamente;
- upload e download funcionam nos dois sistemas;
- currículo/PDF pode ser visualizado ou compartilhado;
- nenhuma tela fica sob notch, Dynamic Island ou barra de navegação;
- comportamento aprovado em build de distribuição, não apenas no navegador desktop.

### MOB-08 — Tratar a área administrativa

Problema: rotas que não começam com `/candidato` ou `/empregador` recebem sidebar e margem inline de 64/256 px em qualquer largura. O admin fica severamente comprimido no celular.

Decisão necessária:

- se o admin faz parte do aplicativo, criar `AdminMobileHeader`, esconder a sidebar abaixo de `lg` e adaptar tabelas;
- se o admin é exclusivamente desktop, bloquear sua abertura no app com mensagem clara e não incluí-lo na navegação mobile.

Critérios de aceite se incluído:

- conteúdo ocupa 100% da largura em mobile;
- navegação administrativa é acessível por drawer;
- tabelas têm versão mobile ou scroll controlado;
- ações críticas pedem confirmação e permanecem identificáveis.

### MOB-09 — Metadados e capacidades de instalação

Implementação condicionada à arquitetura do wrapper:

- documentar se o app é WebView, Trusted Web Activity, PWA empacotada ou outra abordagem;
- adicionar metadados web ausentes somente quando forem consumidos pelo container ou pela versão web;
- alinhar `theme-color`, ícones, splash e cores da status bar;
- não adicionar service worker sem estratégia de cache, versionamento e invalidação;
- garantir que uma atualização web incompatível não quebre uma versão antiga do container.

Critérios de aceite:

- identidade visual consistente entre splash, status bar e aplicação;
- atualização não mantém assets incompatíveis em cache;
- versão do frontend e versão do container são observáveis em suporte;
- rollback do frontend permanece possível.

## 6. Requisitos não funcionais

### Performance

- LCP de telas P0 menor que 2,5 s em dispositivo intermediário e rede 4G controlada;
- INP menor que 200 ms nos fluxos principais;
- CLS menor que 0,1;
- nenhuma tarefa longa recorrente acima de 50 ms durante scroll ou digitação;
- imagens dimensionadas e carregadas conforme visibilidade;
- listas grandes não devem renderizar trabalho desnecessário a cada tecla.

### Acessibilidade

- WCAG 2.2 AA como referência;
- TalkBack e VoiceOver nos fluxos P0;
- suporte a texto ampliado;
- foco visível, ordem lógica e mensagens de erro anunciáveis;
- conteúdo não dependente apenas de cor.

### Observabilidade e privacidade

- registrar versão web, versão do container, sistema operacional e rota em erros, sem PII desnecessária;
- capturar falhas de navegação, telas em branco e rejeições de upload;
- não registrar currículo, senha, token, documento ou payload de pagamento;
- separar erro de frontend, backend, rede e integração nativa.

## 7. Harness de validação

### Testes automatizados

1. Jest/Testing Library para componentes compartilhados, abas, drawer e formulários;
2. testes de integração para preservação de estado e erros de rede;
3. suíte E2E mobile em browser engine Chromium e WebKit;
4. screenshots de regressão nas larguras 320, 390, 430 e 768 px;
5. auditoria automatizada de acessibilidade como gate auxiliar;
6. smoke tests no build Android e no build iOS distribuível.

Se o repositório não tiver ferramenta E2E, adicionar uma solução compatível em mudança isolada, documentada e revisável. A ferramenta não substitui testes em dispositivos reais.

### Dados de teste

- candidato novo sem currículo;
- candidato com currículo completo e textos longos;
- candidato com candidaturas em diferentes estados;
- empregador sem vagas;
- empregador com muitas vagas e candidatos;
- assinatura ativa, inativa, pendente e erro de pagamento;
- sessão expirada;
- rede offline e rede lenta;
- arquivos PDF e imagens nos limites permitidos.

### Checklist manual por release

- instalar versão limpa;
- atualizar sobre versão anterior;
- login, logout e reabertura;
- background por cinco minutos e retomada;
- rotação durante formulário;
- teclado aberto em campos no fim da página;
- upload, download e compartilhamento;
- deep link com app fechado e aberto;
- botão voltar Android;
- VoiceOver/TalkBack no menu e em um formulário P0;
- interrupção de rede durante envio;
- pagamento sem duplicidade;
- revisão de screenshots das lojas após mudanças visuais relevantes.

## 8. Plano de implementação

### Fase 0 — Descoberta do runtime publicado — 0,5 a 1 dia

1. localizar o wrapper Android/iOS e identificar tecnologia;
2. registrar versões mínimas, URLs, permissões e navegação;
3. confirmar se admin está disponível no aplicativo;
4. obter um build instalável de homologação de cada plataforma;
5. congelar matriz de dispositivos e baseline visual.

Saída: inventário nativo e checklist de integração anexados a esta spec.

### Fase 1 — Bloqueadores estruturais P0 — 1 a 2 dias

1. corrigir `TabsList` e adicionar testes;
2. consolidar shell mobile e safe areas;
3. corrigir drawer, footer, scroll e acessibilidade básica;
4. validar login, cadastro e navegação autenticada em 320–430 px;
5. decidir e tratar o admin.

Gate: nenhum fluxo P0 bloqueado por navegação, sobreposição ou largura.

### Fase 2 — Fluxos de candidato — 2 a 4 dias

1. pesquisa e filtros de vagas;
2. detalhes e candidatura;
3. lista/cancelamento de candidaturas;
4. currículo e todas as etapas;
5. verificação, assinatura e configurações;
6. estados de loading, vazio, erro e offline.

Gate: jornada completa de candidato aprovada em Android e iOS de homologação.

### Fase 3 — Fluxos de empregador — 2 a 4 dias

1. dashboard e listagem de vagas;
2. criação e edição de vaga;
3. gestão de candidatos e modais;
4. assinatura e configurações;
5. estados de loading, vazio, erro e offline.

Gate: jornada completa de empregador aprovada em Android e iOS de homologação.

### Fase 4 — Integração nativa e resiliência — 1 a 3 dias

1. botão voltar, deep links e links externos;
2. upload, download, PDF e compartilhamento;
3. safe areas, status bar, splash e teclado;
4. sessão em background/foreground;
5. atualização, cache e compatibilidade entre frontend/container;
6. observabilidade de erros mobile.

Gate: smoke suite aprovada em builds distribuíveis.

### Fase 5 — Regressão e release gradual — 1 a 2 dias

1. executar lint, typecheck, testes, build e E2E;
2. concluir matriz manual em dispositivos físicos;
3. publicar primeiro em faixa interna/fechada;
4. monitorar crash-free sessions, login, candidatura e criação de vaga;
5. ampliar rollout gradualmente;
6. manter rollback pronto para frontend e container.

Gate: zero blocker P0, zero regressão crítica e métricas estáveis durante rollout controlado.

## 9. Ordem de prioridade

| Prioridade | Entrega | Motivo |
|---|---|---|
| P0 | Localizar e validar o wrapper publicado | Sem isso não existe validação real de loja |
| P0 | Corrigir `TabsList` | Afeta formulários centrais de candidato e empregador |
| P0 | Safe areas, teclado e shell mobile | Pode bloquear interação em aparelhos reais |
| P0 | Jornadas completas de candidato | Principal público inicial |
| P0 | Jornadas completas de empregador | Fluxo de oferta e gestão de vagas |
| P1 | Acessibilidade completa do drawer e formulários | Qualidade, inclusão e aprovação sustentável |
| P1 | Offline, retomada e observabilidade | Reduz telas brancas e suporte sem diagnóstico |
| P1 | Admin mobile | Necessário somente se distribuído no app |
| P2 | PWA/metadados adicionais | Depende da arquitetura real do container |

## 10. Definition of Done

A adaptabilidade mobile será considerada concluída quando:

- todos os critérios MOB-01 a MOB-07 estiverem aprovados;
- MOB-08 tiver decisão explícita e implementação coerente;
- não houver overflow horizontal global nas viewports suportadas;
- jornadas P0 passarem em Chromium, WebKit, Android real e iPhone real;
- teclado, safe areas, botão voltar, upload e retomada estiverem validados;
- TalkBack e VoiceOver concluírem os fluxos críticos definidos;
- lint, typecheck, testes, build e E2E estiverem verdes;
- não houver blocker ou critical aberto;
- rollout gradual e rollback estiverem documentados;
- versão web e versão do container puderem ser identificadas em suporte.

## 11. Riscos e mitigação

- **Wrapper fora deste repositório:** localizar antes de alterar contratos de navegação ou cache.
- **Mudança web afetar usuários imediatamente:** usar rollout controlado e compatibilidade retroativa com containers antigos.
- **Safe area duplicada pelo wrapper:** testar responsabilidades do container e do CSS antes de aplicar padding global.
- **Service worker manter versão incompatível:** não habilitar cache offline sem política de versionamento.
- **Formulários longos perderem dados:** preservar estado e criar testes de background/retomada.
- **Correção ampla gerar regressão desktop:** manter testes em 1280 e 1440 px, embora mobile seja a prioridade.
- **Aprovação iOS em andamento:** evitar incluir mudanças nativas não essenciais no build submetido; preparar correções web compatíveis e planejar o próximo binário quando necessário.

## 12. Entregáveis

1. inventário do wrapper Android/iOS;
2. componentes e páginas corrigidos;
3. testes unitários, integração, E2E e screenshots de regressão;
4. matriz manual preenchida;
5. evidências em Android e iOS físicos;
6. notas de release e plano de rollback;
7. relatório pós-rollout com erros e métricas dos fluxos P0.

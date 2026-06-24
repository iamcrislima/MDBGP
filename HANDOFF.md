# HANDOFF — MDB Gestão Partidária
> Data: 2026-06-22
> Stack: React 19 + TypeScript + Vite + Bootstrap 5 + Bootstrap Icons + Chart.js + D3

---

## O que é esse projeto

Sistema interno de gestão partidária do MDB (Movimento Democrático Brasileiro). Permite consultar e gerenciar filiados, mandatários, órgãos partidários, dirigentes, perfis de acesso e usuários, além de exibir dashboards de BI com dados nacionais do partido. É um protótipo de alta fidelidade — toda a UI está implementada, mas os dados são 100% mock (sem backend real).

---

## Como rodar localmente

```bash
npm install
npm run dev
# Acesse http://localhost:5173
```

**Login de acesso:**
- Usuário: `admin` (ou `admin@mdb.org.br`)
- Senha: `123456`

> ⚠️ Não há variáveis de ambiente necessárias — o projeto é totalmente mock.

---

## Variáveis de ambiente

Nenhuma variável de ambiente é necessária no estado atual (dados 100% mock). Quando a integração com backend for iniciada, adicionar aqui as variáveis de API.

---

## Estrutura do projeto

```
src/
  App.tsx                        # Shell principal: layout, sidebar, navbar, roteamento por useState
  main.tsx                       # Entry point — importa tokens.css antes de qualquer outro CSS
  types.ts                       # Todos os tipos de domínio (Filiado, Orgão, Dirigente, etc.)
  tokens.css                     # Design system — fonte canônica de cores, bordas, sombras, tipografia
  index.css                      # Reset e keyframes globais (@keyframes spin, etc.)

  Assets/                        # Logos MDB (SVG, PNG) e foto do Congresso (login)

  components/
    LogoMDB.tsx                  # Logo MDB como componente SVG inline
    BrazilMap.tsx                # Mapa do Brasil interativo com D3 (usado no BI)
    shared/
      Avatar.tsx                 # Avatar com iniciais ou imagem
      Badge.tsx                  # Badge de status (variantes: success, warning, error, info, neutral, navy)
      Button.tsx                 # Botão com variantes (primary, ghost, ghost-primary, danger, icon, link)
      ConfirmDialog.tsx          # Modal de confirmação destrutiva (usa ModalBase, zIndex 2000)
      CustomSelect.tsx           # Select customizado com dropdown acessível
      DataTable.tsx              # Tabela responsiva com paginação e empty state integrados
      DatePicker.tsx             # Input de data com validação
      EmptyState.tsx             # Estado vazio reutilizável (size sm/md)
      FilterPanel.tsx            # Painel de filtros colapsável
      KPICard.tsx                # Card de KPI para dashboards
      LoadingSpinner.tsx         # Spinner CSS (size sm/md/lg, color primary/white/muted, overlay)
      ModalBase.tsx              # Compound component base para todos os modais
      PageHeader.tsx             # Cabeçalho de página com título, subtítulo e slot de ações
      Pagination.tsx             # Paginação standalone
      PessoaDetalheModal.tsx     # Modal de detalhe de pessoa/filiado (collapsible sections + lightbox)
      SectionHeader.tsx          # Cabeçalho de seção interna
      Toast.tsx                  # Notificações temporárias

  data/
    mockData.ts                  # Todos os dados mock: Perfis, Usuários, Mandatários, Filiados,
                                 # Órgãos, Dirigentes, LogAcesso, dados BI (cobertura UF, órgãos por estado)
    mockFP.ts                    # Dados mock específicos de Filiação Partidária (VisaoGeral)

  hooks/
    useBreakpoint.ts             # Hook: { isMobile, isTablet } com breakpoints 768/1024px

  pages/
    LoginPage.tsx                # Tela de login — split layout (foto Congresso + card form)
    BIPage.tsx                   # Dashboard BI — 4 abas: Partido, Filiados, Eleição, Mandatários
    BIDataPage.tsx               # Tabela de dados brutos de BI com filtros e exportação
    DirigentePage.tsx            # Consulta e detalhe de Dirigentes
    FiliacaoPage.tsx             # Consulta de Filiados com filtros avançados
    GerenciarFiliadosPage.tsx    # Gerenciamento de solicitações de filiação
    LogAcessoPage.tsx            # Log de acessos por usuário
    MandatarioPage.tsx           # Consulta e detalhe de Mandatários
    OrgaoPage.tsx                # Consulta e detalhe de Órgãos Partidários
    VisaoGeralFiliacaoPage.tsx   # Dashboard de visão geral de filiação partidária
    perfil/
      PerfilListPage.tsx         # CRUD de perfis de acesso
      PerfilCreatePage.tsx
      PerfilEditPage.tsx
      PerfilViewPage.tsx
      PerfilPermissaoPage.tsx
    usuario/
      UsuarioListPage.tsx        # CRUD de usuários
      UsuarioCreatePage.tsx
      UsuarioEditPage.tsx
      UsuarioViewPage.tsx

  utils/
    colors.ts                    # Constantes de cor para Chart.js (Canvas não resolve CSS vars)
    dateUtils.ts                 # Utilitários de formatação de datas
```

---

## O que está implementado

- ✅ **Autenticação** — tela de login com validação, split layout desktop/mobile
- ✅ **Sidebar responsiva** — colapsada (64px) / expandida (240px) / mobile (overlay)
- ✅ **Navbar** — logo, usuário logado, dropdown com Alterar Senha e Sair, toggle dark mode
- ✅ **Dark mode** — via `data-dark` no `documentElement` (`filter: invert + hue-rotate`)
- ✅ **Roteamento** — `useState<Page>` sem react-router; lazy loading em todos os módulos
- ✅ **Mandatários** — listagem com filtros, detalhe completo com foto, histórico de cargos e timeline
- ✅ **Filiados** — consulta com filtros (UF, município, situação, sexo, cargo)
- ✅ **Gerenciar Filiados** — fila de solicitações com aprovação/rejeição
- ✅ **Órgãos Partidários** — listagem e detalhe com dirigentes vinculados
- ✅ **Dirigentes** — listagem com filtros e modal de detalhe
- ✅ **BI Dashboard** — 4 abas com Bar, Doughnut, Line charts + mapa D3 interativo por estado
- ✅ **BI Dados** — tabela de dados brutos com filtros e exportação mock
- ✅ **Visão Geral Filiação** — dashboard com KPIs, gráficos e timeline de solicitações
- ✅ **Perfis** — CRUD completo com gestão de permissões
- ✅ **Usuários** — CRUD completo com tipo de acesso (Nacional/Estadual/Municipal)
- ✅ **Log de Acesso** — tabela de auditoria de acessos
- ✅ **Design system** — `tokens.css` com todos os tokens visuais + `utils/colors.ts` para Chart.js
- ✅ **ModalBase** — compound component reutilizável (NavyHeader, LightHeader, Body, Footer)
- ✅ **Biblioteca de componentes shared** — Avatar, Badge, Button, EmptyState, LoadingSpinner, DataTable, KPICard, FilterPanel, Pagination, PageHeader, SectionHeader

---

## O que ainda é mock

- 🟡 **Todos os dados** — `src/data/mockData.ts` e `src/data/mockFP.ts` precisam ser substituídos por chamadas de API real
- 🟡 **Autenticação** — login hardcoded (`admin` / `123456`) em `App.tsx`; sem JWT, sessão ou OAuth
- 🟡 **Exportação** — botões "Exportar CSV/PDF" existem na UI mas não geram arquivo real
- 🟡 **Alterar Senha** — modal implementado, mas `handleSavePassword` apenas simula sucesso com `setTimeout`
- 🟡 **Fotos de filiados/mandatários** — URLs externas do `ui-avatars.com`; precisam vir da API
- 🟡 **VisaoGeralFiliacaoPage** — todos os KPIs e gráficos são valores fixos em `mockFP.ts`
- 🟡 **BIDataPage** — tabela de cobertura por UF é estática em `mockData.ts`

---

## Decisões técnicas tomadas

- **`useState<Page>` como roteador** — sem react-router; navegação via `onNavigate`. Substituir por react-router se deep-links ou histórico forem necessários.
- **Inline styles (`React.CSSProperties`)** — sem CSS modules nem Tailwind; intencional para prototipagem rápida e controle granular.
- **`tokens.css` é a fonte canônica** — todas as cores, bordas, sombras e tipografia centralizadas. Importado como primeiro CSS em `main.tsx`.
- **`utils/colors.ts` espelha `tokens.css` em JS** — Canvas API (Chart.js) não resolve CSS variables; este arquivo mantém os mesmos valores hex para uso nos datasets dos gráficos. Manter em sincronia ao alterar cores.
- **`ModalBase` compound component** — todos os modais herdam o mesmo shell (backdrop, z-index, Escape, scroll-lock). Dois padrões: `NavyHeader` (header `#12121f`) e `LightHeader` (header branco).
- **Bootstrap 5 apenas para reset** — sem componentes Bootstrap JS; toda a UI é React puro com inline styles.
- **Lazy loading universal** — `React.lazy` + `Suspense` em todas as páginas; reduz bundle inicial.
- **`useBreakpoint`** — mobile < 768px, tablet 768–1023px, desktop ≥ 1024px.

---

## O que o time tech precisa fazer primeiro

1. **Definir contrato de API** — todos os `MOCK_*` de `mockData.ts` precisam de endpoints correspondentes; nenhuma integração existe ainda
2. **Implementar autenticação real** — substituir hardcode em `App.tsx` por fluxo OAuth2/JWT; definir refresh token e proteção de rotas
3. **Conectar dados de Filiados e Mandatários** — são os módulos com maior volume; priorizar estes endpoints
4. **Revisar `mockFP.ts`** — estrutura própria para VisaoGeralFiliacaoPage; precisa de contrato de API separado
5. **Implementar exportação** — CSV/PDF são funcionalidades expostas na UI mas sem implementação; adicionar antes do lançamento
6. **Adicionar error boundaries** — qualquer exceção em página derruba o app; adicionar `ErrorBoundary` nas páginas críticas

---

## Limitações conhecidas

- ⚠️ **Sem testes** — zero cobertura de testes (unitários, integração ou E2E); adicionar antes de CI/CD
- ⚠️ **BIPage.tsx usa hex locais** — `MDB_GREEN`, `MDB_BLUE` etc. ainda hardcoded no arquivo; funciona, mas não consome `utils/colors.ts`
- ⚠️ **Dark mode por CSS filter** — `filter: invert(1) hue-rotate(180deg)`; fotos e imagens ficam invertidas; solução rápida, não ideal para produção
- ⚠️ **Sem i18n** — todas as strings em português hardcoded; sem contexto de idioma
- ⚠️ **Fotos de avatares** — dependem de `ui-avatars.com`; remover dependência externa em produção
- ⚠️ **Sem error boundaries** — exceção em qualquer página derruba o app inteiro

---

## Contato

Dúvidas sobre decisões de produto/design: **a confirmar**
Repositório: https://github.com/iamcrislima/MDBGP

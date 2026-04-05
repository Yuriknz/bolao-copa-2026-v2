# Bolão Copa 2026 — Contexto Completo para Claude Code

## Identidade do projeto
Aplicação web de bolão para a Copa do Mundo 2026. MicroSaaS em construção.
Repositório: https://github.com/Yuriknz/bolao-copa-2026
Deploy: https://bolao-copa-2026-black.vercel.app

## Stack
- Next.js 15.2.6 + Tailwind CSS → Vercel
- Supabase (PostgreSQL + Edge Functions + Realtime)
- Auth atual: nome simples → localStorage (chave: bolao_user_id)
- API futebol: api-football.com (key configurada no Supabase como secret)

## Credenciais de infra (não commitar)
- Supabase project_id: udiywrqnjqvqpmzqtfll
- Supabase URL: https://udiywrqnjqvqpmzqtfll.supabase.co
- Vercel team: yuriknzs-projects
- Vercel project_id: prj_vbz2unbACmLDmfgUHRme2VyuABYw

## Schema do banco (já aplicado)
Tabelas: users, matches, picks, boloes, bolao_members

### users
id uuid PK | name text | champion_pick text | total_points int | exact_scores int | created_at

### matches
id uuid PK | api_id text unique | team_home text | flag_home text | team_away text | flag_away text
score_home int | score_away int | match_time timestamptz | phase match_phase | status match_status
multiplier int | group_name text

match_phase enum: groups(1x) | r32(2x) | r16(3x) | qf(4x) | sf(5x) | final(6x)
match_status enum: open | locked | live | finished

### picks
id uuid PK | user_id uuid FK | match_id uuid FK | pick_home int | pick_away int
points_earned int | created_at
UNIQUE(user_id, match_id)

### boloes
id uuid PK | name text | code text unique (6 chars auto-gerado) | created_by uuid FK | created_at

### bolao_members
id uuid PK | bolao_id uuid FK | user_id uuid FK | total_points int | exact_scores int | joined_at
UNIQUE(bolao_id, user_id)

## Regras de negócio
- Placar exato = 3 pts × multiplicador da fase
- Acertar vencedor = 1 pt × multiplicador da fase
- Campeão certo = +20 pts bônus
- Palpites travam 5 minutos antes do match_time
- Jogos do mata-mata ficam status=locked até a API preencher os times reais
- Desempate no ranking: maior exact_scores
- Trigger SQL automático calcula pontos quando match.status muda para finished

## Dados no banco
- 72 jogos fase de grupos (status=open, datas de 11/06 a 28/06)
- 16 jogos r32 (status=locked, placeholders)
- 8 jogos r16 (status=locked, placeholders)
- 4 jogos qf (status=locked, placeholders)
- 3 jogos sf + 3º lugar (status=locked, placeholders)
- 1 final (status=locked, placeholder)
Total: 104 jogos

## Rotas do app
/ → Login (digita nome + palpite campeão)
/meus-boloes → Lista bolões do usuário + criar + entrar com código
/bolao/[code] → Ranking do bolão
/bolao/[code]/cartela → Todos os jogos com inputs de palpite
/bolao/[code]/historico → Histórico de palpites do usuário
/ranking-publico → Ranking sem login (Server Component)

## Edge Functions no Supabase
- sync-matches: sincroniza placares da API-Football a cada 2min via pg_cron
  - Quando encontra jogo da API sem correspondência por nome → casa com placeholder por data/hora
  - Preenche times reais, muda status para open automaticamente
  - FOOTBALL_API_KEY configurado como secret no Supabase

## Design system
CSS variables em globals.css:
--bg: #08090e | --surface: #0d1019 | --surface-2: #131824 | --surface-3: #1a2030
--accent: #00e676 | --accent-dim: rgba(0,230,118,0.12)
--gold: #fbbf24 | --red: #f43f5e | --amber: #f59e0b
--text: #dde1ed | --text-muted: #46506e | --text-dim: #272f47
Font: Space Grotesk (títulos display: Bebas Neue)
Padrão: CSS vars inline, sem Tailwind para cores

## Componentes existentes
- Logo.tsx — logo do app
- MatchCard.tsx — card de jogo com input de palpite, status badge, placar real
- StatusBadge.tsx — badge open/locked/live/finished com animação
- BottomNav.tsx — nav inferior contextual (muda links baseado em params.code)
- PageHeader.tsx — cabeçalho de página
- TeamFlag.tsx — exibe bandeira do time
- teamFlags.ts — mapeamento nome→emoji de bandeira

---

## KANBAN ATUAL — METODOLOGIA ÁGIL

### ✅ PRONTO (não mexer)
- [x] Deploy funcionando no Vercel
- [x] Login por nome + localStorage
- [x] Multi-bolão com código de convite (6 chars)
- [x] 104 jogos no banco (grupos + mata-mata)
- [x] Edge Function sync-matches + pg_cron a cada 2min
- [x] Trigger SQL automático de pontos
- [x] RLS configurado para anon role
- [x] Fase r32 (16 avos) adicionada ao enum

---

### 🏃 SPRINT 1 — Polimento e Realtime (executar agora)

**Objetivo:** App pronto para uso real antes da Copa (11 jun)

#### TAREFA 1 — Placar ao vivo via Supabase Realtime
Arquivo: src/app/bolao/[code]/cartela/page.tsx e src/components/MatchCard.tsx

- Subscribir ao canal `matches` do Supabase Realtime
- Quando score_home/score_away/status mudar → atualizar o card sem reload
- Mostrar placar real embaixo dos inputs quando jogo estiver live/finished
- Usar: supabase.channel('matches').on('postgres_changes', ...).subscribe()
```typescript
// Exemplo de subscribe a usar no useEffect da cartela:
const channel = supabase
  .channel('matches-realtime')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'matches'
  }, (payload) => {
    setMatches(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
  })
  .subscribe()
return () => { supabase.removeChannel(channel) }
```

#### TAREFA 2 — Preview de pontos ao digitar palpite
Arquivo: src/components/MatchCard.tsx

- Embaixo dos inputs, mostrar em tempo real o que o palpite valerá
- Se jogo já tem placar real (live/finished): mostrar "Se mantiver: +X pts" ou "+0 pts"
- Se jogo ainda não tem placar (open): mostrar só "Vale até +X pts" com o multiplicador
- Usar a função calcPoints de src/lib/points.ts
- Estilo: texto pequeno, cor verde se > 0, cinza se 0

#### TAREFA 3 — Animação de posição no ranking
Arquivo: src/app/bolao/[code]/page.tsx

- Guardar posições anteriores em useRef
- Quando ranking atualizar: comparar posição atual vs anterior
- Exibir setinha verde ▲ se subiu, vermelha ▼ se desceu, nada se manteve
- Posição e nome ficam com animação de slide suave (CSS transition)

#### TAREFA 4 — Avatar com cor por hash do nome
Arquivo: src/app/bolao/[code]/page.tsx e qualquer lugar com avatar

- Substituir fundo fixo por cor derivada do nome do usuário
- Usar função simples de hash: charCodeAt dos chars → índice numa paleta de 8 cores
- Paleta sugerida (hex): ['#5E4FDB','#0F6E56','#993C1D','#185FA5','#3B6D11','#854F0B','#993556','#5F5E5A']
- Sempre consistente: mesmo nome = mesma cor em qualquer tela
```typescript
function avatarColor(name: string): string {
  const colors = ['#5E4FDB','#0F6E56','#993C1D','#185FA5','#3B6D11','#854F0B','#993556','#5F5E5A']
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}
```

#### TAREFA 5 — Countdown de travamento
Arquivo: src/components/StatusBadge.tsx

- Quando status=open E faltam ≤ 30 min para match_time:
  - Mostrar "Trava em Xmin" com badge amarelo pulsante
- Quando faltam ≤ 5 min: badge vermelho "Travando..."
- Usar setInterval de 30s para atualizar o countdown
- A função minutesUntilMatch já existe em src/lib/points.ts

---

### 📋 SPRINT 2 — Auth + Monetização (depois da Copa começar)

**Dependências: responder 4 perguntas antes de executar**
1. Manter login por nome ou migrar para magic link (email)?
2. Qual domínio? (.com.br, .gg, .app?)
3. Integrar WhatsApp ou manter tudo no app?
4. Plano Pro: por bolão criado ou assinatura mensal?

#### Tarefas planejadas (aguardando respostas acima):
- [ ] Supabase Auth magic link
- [ ] Migrar user_id de localStorage para JWT
- [ ] Coluna plan (free/pro) na tabela users
- [ ] Gate: free = 1 bolão + 10 participantes
- [ ] Stripe: produto + preço
- [ ] Edge Function: webhook Stripe → atualiza plan
- [ ] Tela de upgrade no app
- [ ] Landing page pública com CTA de venda

---

### 🎮 SPRINT 3 — Gamificação + Viralidade (durante a Copa)

#### Tarefas planejadas:
- [ ] Share imagem ranking (html2canvas → download/WhatsApp)
- [ ] Streak de acertos (3+ seguidos = badge fogo no nome)
- [ ] Reações ao vivo nos jogos (emoji voando via Supabase Realtime)
- [ ] Notificação in-app "você subiu para Xº lugar"
- [ ] Badge "último a palpitar" (menos de 1min antes do travamento)
- [ ] Palpite duplo: 1 por rodada, vale 2× os pontos
- [ ] Painel admin: atualizar placar manualmente (fallback da API)

---

## Análise dos concorrentes (contexto para decisões de produto)

### SoccerBolão
- App mobile nativo (Android/iOS), 100% gratuito, sem modelo de receita
- Tem ligas públicas e bolões privados, múltiplas competições
- Fraquezas: UX datada, sem notificações inteligentes, sem WhatsApp, sem receita

### BolãoAI
- Web + WhatsApp como canal principal (maior diferencial)
- Lembretes automáticos via WhatsApp, ranking enviado no grupo
- Modelo de receita: plano corporativo B2B (empresas para engajamento de equipe)
- Fraquezas: sem tempo real no app, UI genérica, foco B2B deixa B2C abandonado

### Nossos diferenciais únicos
1. Design premium dark-mode — nenhum concorrente tem isso
2. Fricção zero — login só por nome, sem app, sem cadastro
3. Tempo real nativo — Supabase Realtime direto no browser sem WhatsApp
4. Multi-bolão com código — grupos separados, link de convite simples
5. Copa 2026 focado — 104 jogos, fases corretas, multiplicadores por fase
6. Gamificação (a implementar) — streaks, badges, reações, palpite duplo

---

## Regras de desenvolvimento
- Sempre usar CSS vars do design system (--accent, --surface, etc.), não hardcodar cores
- `export const dynamic = 'force-dynamic'` em toda page que usa localStorage ou supabase client
- Cliente Supabase é lazy (proxy) — nunca instanciar fora de função
- Depois de cada feature: `git add . && git commit -m "feat: ..." && git push`
- Vercel faz deploy automático a cada push na main
- Não criar arquivos de teste por enquanto
- Não modificar supabase/migrations/ — migrações são feitas via MCP do Claude.ai
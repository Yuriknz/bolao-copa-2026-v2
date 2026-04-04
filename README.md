# ⚽ Bolão Copa 2026

Aplicação web de bolão para palpitar nos jogos da Copa do Mundo 2026.

## Stack
- **Frontend**: Next.js 15 + Tailwind CSS → Vercel
- **Banco de dados**: Supabase (PostgreSQL)
- **Autenticação**: Nome simples (localStorage)

## Funcionalidades
- ⚽ Cartela com todos os jogos por fase
- 🏆 Ranking ao vivo com pontuação
- 📋 Histórico de palpites
- 🌐 Ranking público em `/ranking-publico`
- ⚠️ Aviso quando jogo vai travar em breve
- 🔒 Palpites travam 5 minutos antes do jogo

## Pontuação
| Acerto | Pontos |
|--------|--------|
| Placar exato | 3 pts × multiplicador da fase |
| Só o vencedor | 1 pt × multiplicador da fase |
| Campeão correto | +20 pts bônus |

**Multiplicadores por fase:** Grupos 1× | Oitavas 2× | Quartas 3× | Semi 4× | Final 5×

## Setup Local

```bash
# 1. Instalar dependências
npm install

# 2. Criar .env.local com suas credenciais do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key

# 3. Rodar localmente
npm run dev
```

## Deploy (Vercel)

1. Conecte o repositório no [Vercel](https://vercel.com)
2. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático a cada push no `main`

## Populando os jogos

Os jogos precisam ser inseridos na tabela `matches` do Supabase.
Acesse o **Supabase Dashboard → Table Editor → matches** e insira os jogos da Copa.

Exemplo de inserção via SQL:
```sql
insert into matches (team_home, flag_home, team_away, flag_away, match_time, phase, multiplier, group_name)
values ('Brasil', '🇧🇷', 'México', '🇲🇽', '2026-06-15 18:00:00-03', 'groups', 1, 'Grupo D');
```

## Estrutura de pastas

```
src/
  app/
    page.tsx          # Login
    cartela/          # Cartela de jogos
    ranking/          # Ranking (autenticado)
    historico/        # Histórico de palpites
    ranking-publico/  # Ranking público (sem login)
  components/
    BottomNav.tsx     # Navegação inferior
    MatchCard.tsx     # Card de jogo com input de palpite
    StatusBadge.tsx   # Badge de status do jogo
  lib/
    supabase.ts       # Cliente Supabase
    points.ts         # Cálculo de pontos
  types/
    index.ts          # Tipos TypeScript
supabase/
  migrations/         # Migrations SQL
```

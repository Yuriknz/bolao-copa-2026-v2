# Bolão Copa 2026 — Contexto para Claude Code

## Stack
- Next.js 15.2.6 + Tailwind CSS → deploy no Vercel
- Supabase (PostgreSQL) — project_id: udiywrqnjqvqpmzqtfll
- Autenticação: só nome, salvo em localStorage com chave `bolao_user_id`

## Repositório
https://github.com/Yuriknz/bolao-copa-2026

## Regras de negócio
- Placar exato = 3 pts × multiplicador da fase
- Acertar só o vencedor = 1 pt × multiplicador
- Multiplicadores: groups=1x, r16=2x, qf=3x, sf=4x, final=5x
- Palpites travam 5 min antes do jogo (status: open → locked → live → finished)
- Palpite do campeão = +20 pts bônus
- Desempate no ranking: maior número de placares exatos

## O que já está pronto
- Tela de login (/) com dropdown de campeão customizado
- Cartela (/cartela) com jogos por fase + tabs
- Ranking (/ranking) com pontuação em tempo real
- Histórico (/historico) com palpites passados
- Ranking público (/ranking-publico) sem login
- Schema Supabase: tabelas users, matches, picks
- Trigger automático de cálculo de pontos ao finalizar jogo
- RLS configurado para role anon

## O que FALTA implementar
1. Popular a tabela `matches` com todos os jogos da Copa 2026
   - Inserir via SQL no Supabase com team_home, flag_home, team_away,
     flag_away, match_time (UTC-3), phase, multiplier, group_name
2. Integração com API de futebol para atualizar placares automaticamente
   - Supabase Edge Function que roda a cada 2 min durante jogos ao vivo
   - API sugerida: api-football.com (plano gratuito)
   - Env var necessária: FOOTBALL_API_KEY
3. Aviso de travamento mais visível (countdown nos cards quando < 30min)
4. Tela de admin simples para atualizar placares manualmente (fallback)
5. Testes com amigos reais e ajustes de UX

## Como fazer deploy
Qualquer `git push` na branch `main` trigga deploy automático no Vercel.
Após mudanças no Supabase (schema), documentar em supabase/migrations/.

## Variáveis de ambiente (já configuradas no Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://udiywrqnjqvqpmzqtfll.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

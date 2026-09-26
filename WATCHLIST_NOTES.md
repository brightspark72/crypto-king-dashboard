# Desk Watchlist patch notes (22–23 Sep 2026)

Surgical edit to `index.html` — styling, CoinGecko fetch, and side panel preserved.

## What changed

### Watchlist UI (`#view-watchlist`)
- Added **desk-rules banner** (leg-one: $500→$10K Binance spot, 4–5% risk, no leverage; RENDERUSDT on dip; research-only until tokenomics + liquidity + pullback; Monday 9am scan).
- Added **Rank Climbers card grid** (`#rankClimberGrid`) with status badges; cards use `data-open-id` so the existing side-panel click handler opens detail.
- Added **filter pills**: All | Rank Climbers | Core | Armed | Needs tokenomics (`sleeveFilter` + optional card dimming).
- Expanded table columns: **Ticker | Status | Binance | Price | 24h | 7d | Market Cap**.

### CSS
- New classes: `.desk-banner`, `.rank-grid`, `.rank-card`, `.wl-badge` (`.watch` / `.needs` / `.skip` / `.armed` / `.core`), `.filter-pills` / `.filter-pill.active`.

### Data / JS
- `COIN_IDS` expanded with climbers: `virtual-protocol`, `geodnet`, `grass`, `aioz-network`, `cap-4` (plus existing majors + FET / RENDER / TAO).
- `META` now carries `status`, `binance`, `sleeve`, and climber `why` one-liners.
- `SECTORS` adds **DePIN** (warm/hot) with GRASS / GEOD / AIOZ.
- `FALLBACK.markets` stubs for new ids (approx from research).
- `DEEP_DIVE` queue: RENDER, VIRTUAL, GEOD, AIOZ, CAP (+ legacy NEAR/ARB/ENA/ZEC). FET removed as primary slot.
- `fillPanel` / `panelTokStatus` status-driven (Armed candidate / Watch / Needs tokenomics / Skip primary / Core).
- `CACHE_KEY` bumped to `ck_dashboard_cache_v2`.

### Briefings & Tokenomics tab
- Overview + Narratives briefing lightly mention rank-climber watchlist + RENDER first ticket.
- Tokenomics slots: RENDER (armed), VIRTUAL, GEOD, AIOZ, CAP; FET noted as skip-primary in the queue note.

## Status shortlist (research)
| Id | Ticker | Status | Binance | Notes |
|----|--------|--------|---------|-------|
| virtual-protocol | VIRTUAL | Watch | Yes | AI agents ~$470M |
| geodnet | GEOD | Watch | Unknown | DePIN GNSS ~$118M |
| grass | GRASS | Watch | No (futures) | DePIN AI bandwidth ~$302M |
| aioz-network | AIOZ | Needs tokenomics | Unknown | DePIN/AI streaming |
| cap-4 | CAP | Needs tokenomics | Unknown | DeFi credit / FDV overhang |
| fetch-ai | FET | Skip primary | Yes | AI thermometer only |
| render-token | RENDER | Armed candidate | Yes | Leg-one primary on dip |
| bittensor | TAO | Watch | Yes | Pullback; awkward lot size |

Core majors kept as desk context: BTC, ETH, SOL, NEAR, ARB, ENA, AVAX, UNI, ZEC.

## Sanity
- Key strings present; `node --check` on embedded script passed.

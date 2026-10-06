# Crypto King — Command Center

Single-file research dashboard for Matthew (Crypto King advisor bot).

## Open

Open `index.html` in a browser (double-click or serve locally):

```bash
cd /workspace/crypto-king-dashboard
python3 -m http.server 8765
# then visit http://localhost:8765
```

## Data

- Live prices / market cap / dominance: [CoinGecko](https://www.coingecko.com/en/api) free API (no key)
- Fear & Greed: [Alternative.me](https://alternative.me/crypto/fear-and-greed-index/)
- Narratives & briefing: hardcoded as of 21 Sep 2026; edit the HTML to update copy

Rate limits: free CoinGecko may return 429. The dashboard caches the last good snapshot in `localStorage` and falls back gracefully.

## Disclaimer

Not financial advice · For research with Crypto King

## Trade setups tab

`index.html#setups` shows one live candlestick chart per setup (Binance Spot klines pulled client-side, TradingView Lightweight Charts 4.1.7 from jsDelivr). Levels live in `setups.json` so routines can update them without touching the HTML: per setup `symbol`, `state` (`live` / `waiting` / `invalidated`), `status_label`, `setup_date`, `setup_ts` (ISO, used to check whether stop/TP were touched since the setup), `zone` `[low, high]`, `entry`, `stop`, `stop_limit`, `tp1`, `tp1_r`, `tp2`, `tp2_r`, `swing_high`, `swing_high_date`, `notes`; plus top-level `updated` / `updated_label`. Use `null` for levels that are not armed. Public page: setup levels only, never holdings or sizes.

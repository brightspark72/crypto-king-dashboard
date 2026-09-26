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

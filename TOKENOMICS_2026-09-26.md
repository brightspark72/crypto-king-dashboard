# Crypto King — Tokenomics Reviews (as of Sat 26 Sep 2026)

Research only. No accounts were touched. Market data: CoinGecko `/coins/markets` snapshot, last_updated 26 Sep 2026 11:32 BST. Binance: `api.binance.com` is geo-blocked from the research box ("restricted location"), so pair status and 24h volume came from the public mirror `data-api.binance.vision` (`exchangeInfo` + `ticker/24hr`, pulled ~11:40 BST). CoinGecko 24h volume is summed across all venues. Binance volume is the USDT pair only.

Matthew's rules: Binance Spot liquid only for leg one · no leverage · clean tokenomics (manageable unlocks, real sinks) · ≥2R setups · correlated AI names count as one risk · RENDERUSDT is the intended first trade on a dip · FET is skip-primary (not researched).

## Summary table

| Token | Price | MC | FDV | FDV/MC | Circ % | Binance Spot USDT | Binance 24h vol | Burn/sink verdict | Unlock risk (6 mo) | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| RENDER | $2.01 | $1.043B | $1.073B (total) / ~$1.29B (max) | 1.03 (1.24 at max) | 97.2% of total / 80.5% of max | Yes (TRADING) | $9.33M | BME is live and real, but small. Emissions reaching market were ~4.5x burns over 90d | Low. No cliffs. ~492k/month mint | **Buy-ready on pullback** |
| VIRTUAL | $0.790 | $520.3M | $790.3M | 1.52 | 65.8% | Yes (TRADING) | $8.30M | No ongoing VIRTUAL burn. The 2025 buyback burned *agent* tokens | Low scheduled. 35% DAO treasury overhang | **Watch only** |
| GEOD | $0.258 | $119.4M | $248.2M | 2.08 | 46.2% of max | **No** | — (CG all-venue $3.95M) | Best of the set: 80% of revenue buys back and burns GEOD, roughly ≈ mining emissions after the halving | Medium–High. Continuous team/investor vesting | **Watch only** |
| AIOZ | $0.123 | $157.5M | $157.5M | 1.00 | ~100% (no max cap) | **No** | — (CG $8.71M) | Burns exist on paper, but supply is still growing ~6%/yr | Inflation ~6%/yr, dropping to 5% on 25 Dec 2026 | **Skip** |
| CAP | $0.0511 | $79.7M | $511.0M | 6.41 | 15.6% | **No** (spot) | — (CG $7.85M) | "Discretionary buybacks" only. None verified | None in 6 mo. 26 Jun 2027 cliff ≈10.8% of supply | **Skip** |
| TAO | $318.75 | $3.616B | $6.697B | 1.85 | 54.0% | Yes (TRADING) | $54.87M | No real permanent sink. Fees are recycled, which only delays the halving | No unlocks, but ~3,600 TAO/day (≈11.6%/yr of circ) | **Wait** |

AI-correlated cluster (one risk): RENDER, TAO, VIRTUAL, plus AIOZ partly (FET excluded). RENDER takes the AI slot.

---

## 1. RENDER (render-token)

**Market (CG, 26 Sep):** $2.01 · MC $1,043.3M · FDV $1,073.0M (CG uses total supply) · circ 518,776,241 · total 533,536,415 · max 644,245,094 · 97.2% of total / 80.5% of max circulating · FDV/MC 1.03 (≈1.24 if FDV uses max supply, i.e. ~$1.29B). 7d +28.1%, 30d +27.0%. ATH $13.53 (Mar 2024), −85%.

**What the token does:** Payment token for the Render Network (decentralised GPU rendering, plus AI compute via "Dispersed"). Jobs are priced in fiat and settled by **burning** RENDER. Node operators are paid from a governance-set emission (Burn-Mint Equilibrium, RNP-001). Value only accrues if paid demand (burns) grows relative to emissions. There is no staking.

**Emissions/unlocks:**
- Year 1 (RNP-006): 9,126,804 RENDER. Year 2 (RNP-018): 5,905,580. Year 3 / 2026 (RNP-022): ~5.9M, running 20 Dec 2025 – 19 Dec 2026, minted monthly as 492,132 RENDER (432,132 to the emission reserve and 60,000 to the node-reward vault), around the 23rd of each month.
- Next mints: **23 Oct, 23 Nov, 23 Dec 2026**. Each is ~0.09% of circulating supply. Reserve payouts to the Foundation happen roughly quarterly (1.25M in Aug 2026), with the next one expected ~Nov.
- **Year-4 (2027) emission vote is likely before year-end.** This is a key watch item: a bigger allocation would dilute more.
- There are no vesting cliffs. The original allocations were distributed long ago.

**Allocation (original 2017 RNDR):** 25% public sale · 65% escrow/"user development fund" · 10% reserve (team, advisors, partners, 6-month lock). A vault run for OTOY holds **~81.9M RENDER (~15.8% of circ)** and has been dormant for 90d. It is an overhang to watch.

**Burns/sinks:** BME is **live**. The Foundation dashboard shows ~1.54M RENDER burned cumulatively. On-chain analysis for the 90d to 25 Sep 2026: **333,356 burned vs 1.49M emitted into the float**, so net **+0.22%/90d**. That is mildly inflationary, and 250k of the burns were RENDER sent by a Foundation vault rather than bought on market. Dune weekly burns in Sep 2026 ran ~1k–54k/week against a 492k monthly mint. **Verdict: a real, usage-linked sink but not meaningful vs emissions yet (~0.2% of MC/yr).** Upside catalyst: RNP-023 (Salad GPU network paying in RENDER) could multiply burns, but its burn wallets were not yet active.

**Binance:** RENDERUSDT **TRADING** (also USDC, BTC, TRY, EUR, BRL, IDR; RENDERFDUSD is in BREAK). 24h: last $2.007, +2.9%, high $2.033, low $1.893, **quote vol $9.33M**. CG all-venue 24h vol: $99.5M.

**Red flags:** burns are far below emissions · OTOY vault overhang · uncertain Year-4 emission size · high top-holder concentration (third-party claim, unverified) · price is extended (+28% 7d), so this is **not** a dip right now.

**Verdict: Buy-ready on pullback.** The supply picture is clean: ~97% of total supply is circulating, there are no cliffs, and inflation is ~1%/yr and capped. The sink is real even though it is small. It is liquid on Binance Spot. Wait for a pullback that gives a ≥2R structure rather than chasing a +28% week. It is the only AI-cluster position.

**Sources:** CoinGecko API (markets) · https://know.rendernetwork.com/basics/burn-mint-equilibrium · https://stats.renderfoundation.com/ · https://github.com/rendernetwork/RNPs (RNP-022/023) · https://mrnasdog.com/research/render/inflation · https://dune.com/pyor_xyz/render-network · https://coinlaw.io/render-statistics/ · https://medium.com/render-token/rndr-token-sale-details-3386e75a6fff · https://data-api.binance.vision/api/v3/ticker/24hr?symbol=RENDERUSDT

---

## 2. VIRTUAL (virtual-protocol)

**Market:** $0.7898 · MC $520.3M · FDV $790.3M · circ 658,385,842 · total/max 1,000,000,000 · 65.8% circulating · FDV/MC 1.52. 7d +15.9%, 30d +3.5%. ATH $5.07 (Jan 2025), −84%.

**What the token does:** The base currency of the Virtuals AI-agent launchpad on Base (plus Solana and others). Agent tokens launch on bonding curves paired with VIRTUAL, their LPs are paired with VIRTUAL, and VIRTUAL is used for inference fees and Agent Commerce Protocol payments. Value accrual is indirect: demand comes from being the pair/settlement asset, and fees go to the treasury, agent creators and subDAOs.

**Emissions/unlocks:** Tokenomist lists VIRTUAL as **fully unlocked**, with vesting ended in 2023. There are **no scheduled unlocks in the next 6 months.** However, the **35% (350M) Ecosystem Treasury** (DAO multisig, the ~34% non-circulating share) can be emitted by governance, capped at 10%/yr of the treasury (~35M/yr, ≈5% of circ). A governance proposal to stream up to 6% of supply to Virgen Labs was tied to $10/$20/$40 TWAP milestones. Those are far above the current price, so it is not an immediate risk.

**Allocation:** Public distribution 60% · Ecosystem treasury 35% · Liquidity pool 5% (Tokenomist).

**Burns/sinks:** **There is no protocol-level VIRTUAL burn.** The Jan 2025 program took 12,990,427.85 VIRTUAL of post-bonding fees and used them to buy and burn **agent tokens** (GAME, AIXBT, etc.) over a 30-day TWAP. That was a one-off, and it effectively *sold* VIRTUAL. The post-bonding tax was then re-routed: 30% to the creator, 20% to affiliates, 50% to the agent subDAO. **Verdict: not a meaningful VIRTUAL sink.**

**Binance:** VIRTUALUSDT **TRADING** (also USDC, TRY, IDR). 24h: $0.7902, +1.36%, **quote vol $8.30M**. CG all-venue: $97.0M.

**Red flags:** 35% treasury overhang controlled by a multisig · protocol revenue reportedly collapsed from its Q4 2024 peak (one third-party source says ~$8.9K/day in Jun 2026; Unverified, not checked on-chain) · agent incentives may exceed revenue · whale/bridge concentration · correlated AI beta.

**Verdict: Watch only.** It is liquid and there are no vesting cliffs, but it has no real sink, a large discretionary treasury, and weak revenue. It would also double up the AI risk alongside RENDER.

**Sources:** CoinGecko API · https://tokenomist.ai/virtual-protocol/buyback · https://whitepaper.virtuals.io/ · https://index.envelop.is/reports/virtual_audit.html · https://unrollnow.com/status/1879474894007927189 (Virtuals' buyback post) · https://earlythunder.com/opportunities/virtuals-protocol · https://gov.virtuals.io/ · https://data-api.binance.vision/api/v3/ticker/24hr?symbol=VIRTUALUSDT

---

## 3. GEOD (geodnet)

**Market:** $0.2584 · MC $119.4M · FDV $248.2M · circ 462,370,403 · total 961,413,068 · max 1,000,000,000 · 48.1% of total / 46.2% of max · FDV/MC 2.08. 7d +1.9%, 30d +15.8%. ATH $0.374 (Jan 2025), −31%.

**What the token does:** Rewards for operators of GEODNET's decentralised RTK/GNSS base-station network (centimetre-level positioning). Enterprises (the Triton note names John Deere, DJI and TomTom) buy data subscriptions in USD. **80% of revenue buys GEOD on the open market and burns it.** The other 20% funds the Foundation. The token has no equity alongside it, so all value flows through the token (Blockworks filing).

**Emissions/unlocks:**
- Mining: the base reward **halves every 30 Jun**. Triple-band stations earn up to 6 GEOD/day for 1 Jul 2026 – 30 Jun 2027 (it was 12). The mining pool is 35% of supply.
- Team, investor and ecosystem allocations vest over multiple years, continuously and linearly, with **no discrete cliff** (DeFiLlama/TokenToria). One model has investor vesting linear to **28 Dec 2026** and team vesting to Jun 2029, but that is inferred by TokenRadar, not official. A third-party estimate puts all categories at **~22.6M GEOD/month (~4.9% of circ/month)**. **Unverified:** the official vesting portal (vesting.geodnet.com) is wallet-gated, and the docs list only allocation wallets, not schedules.

**Allocation:** Mining 35% · Team 25% · Investors 25% · Ecosystem 10% · Vendor/Marketing 3% · Public sale 2% (Blockworks Token Transparency).

**Burns/sinks:** **Live, on-chain, and meaningful.** DeFiLlama shows 30d fees of $892.7K and a trailing-year annualised $7.9M. For Q3-2026-to-date, token buybacks were $1.55M vs mining rewards of $1.23M. After the halving, buybacks now roughly offset **mining** emissions. They do **not** offset team/investor vesting. Triton puts ARR at ~$10.6M and a ~8% buyback yield (secondary). **Verdict: this is the best sink design in the set.**

**Binance:** **No spot listing.** GEODUSDT returns "Invalid symbol", and there is no GEOD base asset in Binance spot exchangeInfo. Venues are Upbit (KRW), Gate, MEXC and Raydium. CG all-venue 24h vol is only **$3.95M**.

**Red flags:** fails the Binance-Spot rule · thin liquidity · FDV is 2x MC with ongoing team/investor vesting · the net-deflation threshold rises with price (fixed-token emissions against USD buybacks).

**Verdict: Watch only.** It has the cleanest "real revenue into burn" story, but it is not on Binance Spot and liquidity is too thin for leg one. Revisit if it lists on Binance Spot or once investor vesting ends (end-2026 per the model).

**Sources:** CoinGecko API · https://docs.geodnet.com/geod-token/tokenomics · https://blockworks.com/token-transparency/filing/geodnet · https://defillama.com/protocol/geodnet · https://defillama.com/unlocks/geodnet · https://tokenradar.ai/tokens/geodnet/tokenomics · https://www.tritonliquid.com/research/geodnet-geod-research-note · https://earlythunder.com/opportunities/geodnet · https://geodnet.com/file/Geodnet%20whitepaper.pdf

---

## 4. AIOZ (aioz-network)

**Market:** $0.1230 · MC $157.5M · FDV $157.5M · circ 1,280,443,941 · total 1,280,571,742 · **no max supply** (inflationary) · ~100% circulating · FDV/MC 1.00. 7d +45.2%, **30d +102.8%**. ATH $2.65 (2021), −95%.

**Live chain check:** native supply from the AIOZ LCD (`/cosmos/bank/v1beta1/supply/by_denom?denom=attoaioz`) on 26 Sep was **1,280,576,787 AIOZ**, against 1,276,140,381 on 5 Sep (coinyq). That is +4.44M in 21 days, ≈ **6.0% annualised net growth.**

**What the token does:** The native coin of AIOZ Network, a Cosmos/EVM chain (id 168). It is used for gas, validator staking/governance, and payments for AIOZ Storage/Pin/Stream/AI, and it rewards edge nodes (DePIN). ETH and BNB tokens are bridge wrappers, not extra supply.

**Emissions:** Tokenomics 2.0 sets inflation at 8% (Dec 2023), 7% (Dec 2024), **6% (25 Dec 2025)**, and **5% from 25 Dec 2026**, which is the resting rate. 50% goes to validators/delegators and 50% to the treasury. Over the next 6 months that is ~3% of supply (~38M AIOZ). There are no vesting cliffs because supply is fully issued plus inflation.

**Allocation:** Original genesis allocation (1B AIOZ, Dec 2021) is **Unverified**; I could not confirm the breakdown from official docs in this pass. The treasury receives 50% of ongoing inflation.

**Burns/sinks:** Per the docs: 50% of chain transaction fees, plus 5% each of DePIN rewards, infrastructure revenue and native-dApp revenue. **No published burn totals were found.** The live supply check shows net growth ≈ the full 6% inflation, so **burns are negligible vs emissions.**

**Binance:** **No spot listing** (AIOZUSDT "Invalid symbol"). CG all-venue 24h vol: $8.71M.

**Red flags:** fails the Binance-Spot rule · perpetual ~5–6% inflation with half going to the treasury · burns are immaterial · it doubled in 30 days (chase risk) · bridge wrappers are owner-mintable (centralised) · the 2021 ATH makes it a legacy-bag supply overhang.

**Verdict: Skip.** It is not on Binance Spot, inflation is structural, and the sink does not show up in supply data.

**Sources:** CoinGecko API · https://docs.aioz.network/overview/aioz-tokenomics · https://aioz.network/blog/aioz-network-tokenomics-2-0 · https://aioz.network/aioz-whitepaper-v2.0.pdf · https://coinyq.com/coins/aioz-network · https://lcd-dataseed.aioz.network/cosmos/bank/v1beta1/supply/by_denom?denom=attoaioz

---

## 5. CAP (cap-4, Cap Labs — not the older "Cap Finance")

**Market:** $0.05108 · MC $79.7M · FDV $511.0M · circ 1,560,000,000 · total/max 10,000,000,000 · **15.6% circulating** · **FDV/MC 6.41**. 7d −15.9%, 30d −27.0%. ATH $0.0783 (14 Aug 2026), ATL $0.0155 (12 Jul 2026). TGE was 26 Jun 2026.

**What the token does:** The governance token of Cap, an on-chain credit protocol. cUSD is a dollar asset backed by USDC, USDT, BUIDL and similar. stcUSD earns yield from loans to institutional operators, with those loans backed by delegator collateral via Symbiotic/EigenLayer. CAP governs parameters, collateral, operator onboarding and fees. **Staking utility is still "TBD" in the docs.**

**Allocation (docs.cap.app):** Ecosystem & Community 47.37% · Private investors ≤20% · Team ≤20% · ICO 5% · Private TVL deals 3.75% · Echo community sale 3.28% · Market makers 0.6%.

**Unlocks:** **No scheduled cliff in the next 6 months.** On **26 Jun 2027** a cliff unlocks 25% of the investor, team and Echo allocations, about **1.082B CAP (~10.8% of supply, ~69% of current MC)** per tokenomics.com. After that, monthly linear vesting runs for 3 years to Jun 2030. **Unverified:** the release schedules for Private TVL deals ("undisclosed") and the remaining Ecosystem & Community tokens (trackers conflict).

**Burns/sinks:** The docs say only "Revenue generated will be used to conduct **discretionary buybacks**". **No executed buyback was verified.** There is no burn.

**Binance:** **No spot pair** (CAPUSDT "Invalid symbol" on spot exchangeInfo). Reports say Binance Alpha plus a **CAPUSDT perpetual** listed 27 Jun 2026. That perp is unverified by API (fapi is geo-blocked), and it is irrelevant anyway under the no-leverage rule. CG all-venue 24h vol: $7.85M.

**Red flags:** 6.4x FDV/MC with 84% locked · big 2027 cliff · token utility mostly TBD · downtrend since the Aug ATH · ticker collision with the old Cap Finance.

**Verdict: Skip.** It is not on Binance Spot, the FDV overhang is extreme, and it has no live sink.

**Sources:** CoinGecko API · https://docs.cap.app/overview/tokenomics · https://app.tokenomics.com/tokenomics/cap/unlocks · https://app.tokenomics.com/tokenomics/cap · https://www.gate.com/news/detail/cap-labs-cap-token-launches-june-26-with-156-initial-circulation-22069740 · https://jrkripto.com/en/news/what-is-cap · https://www.cap.app/blog/cap-launches-on-megaeth

---

## 6. TAO (bittensor)

**Market:** $318.75 · MC $3,616.4M · FDV $6,697.3M · circ 11,339,646 · total/max 21,000,000 · 54.0% circulating · FDV/MC 1.85. 7d +21.7%, 30d +23.0%. ATH $757.60 (Mar 2024), −58%.

**What the token does:** The base asset of Bittensor's decentralised ML network. TAO is emitted per block and split across subnets according to each subnet's alpha-token price EMA (dTAO, since Feb 2025). Inside each subnet, 18% goes to the owner, 41% to miners and 41% to validators/stakers. TAO is staked into subnet pools for alpha and used for registration. Demand comes from staking and subnet speculation.

**Emissions:** First halving in **Dec 2025**. Emission is now **0.5 TAO/block, ≈3,600 TAO/day, ≈1.31M/yr ≈ 11.6% of circulating** (my calculation), or ~657k TAO (~5.8% of circ) over the next 6 months. The next halving (to 0.25) triggers when issuance hits **15.75M**. That is ~4.4M TAO away, roughly 3+ years at current rates (my estimate). Recycling pushes it later.

**Unlocks/allocation:** Fair launch, with no premine and no team/investor vesting. All supply comes from emissions (per Bittensor docs and taostats). **There are no unlock events.** The dilution comes from emissions instead.

**Burns/sinks:** Registration costs and transaction fees are **recycled**. They are subtracted from issuance and are *re-emittable*, which delays halvings but is not a permanent burn. Some tokens are truly burned (for example owner-directed miner burns), but the volume is not quantified. Mature subnets see protocol buybacks of **alpha** (not TAO). **Verdict: no meaningful permanent TAO sink. Supply control is the halving schedule.**

**Binance:** TAOUSDT **TRADING** (also USDC, BTC, FDUSD, TRY, JPY, IDR, USD1, U). 24h: $319.30, +5.31%, **quote vol $54.87M**, the deepest of the six. Lot size is awkward for small accounts (existing dashboard note).

**Red flags:** ~11.6%/yr emission-driven inflation · correlated AI beta with RENDER · extended after a +22% week · dTAO/alpha complexity and subnet-token dilution.

**Verdict: Wait.** It is liquid and has fair-launch distribution, but emissions are heavy, there is no real sink, and it would double the AI risk while RENDER is the chosen AI trade. Consider it only as an alternative to RENDER, not in addition to it, and only on a proper pullback.

**Sources:** CoinGecko API · https://www.bittensor.com/docs/concepts/emissions · https://docs.taostats.io/docs/tao · https://bittensorhalving.com/ · https://taopedia.org/wiki/recycling/ · https://bittensor.com/whitepaper · https://data-api.binance.vision/api/v3/ticker/24hr?symbol=TAOUSDT

---

## Unverified / caveats
- RENDER top-holder concentration: third-party only.
- VIRTUAL 2026 revenue run-rate: third-party only, not verified on-chain.
- GEOD monthly vesting amount (~22.6M/mo) and investor end date (28 Dec 2026): these are third-party models. The official vesting portal is wallet-gated.
- AIOZ genesis allocation breakdown and cumulative burn totals: not published or found.
- CAP Private TVL deals and remaining Ecosystem release schedule are undisclosed. The Binance CAPUSDT perp was not API-verified (geo-block).
- TAO: the quantity of truly burned (vs recycled) TAO was not quantified. The next-halving timing is my own estimate.
- Binance volumes come from the data-api.binance.vision public mirror because api.binance.com is geo-blocked from the research box. They are a rolling 24h window on a Saturday.

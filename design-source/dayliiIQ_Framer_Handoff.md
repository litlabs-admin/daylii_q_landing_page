# dayliiIQ — Landing Page · Framer Build Spec

A complete handoff to rebuild the dayliiIQ landing page natively in Framer. The attached **`dayliiIQ_Landing_Page.html`** is the pixel-accurate source of truth — open it in a browser to see exact spacing, motion, and the toggle behavior, and inspect any element to copy precise values. This doc gives you the tokens, structure, copy, and Framer-specific build notes.

---

## 0. What you're building

A **single-page, dual-audience** landing page. One URL serves both **retailers** and **manufacturers**; a segmented toggle in the hero re-skins the value section and one hero line between the two audiences. Default state is **Retailer**.

**The one mechanic that matters:** the audience toggle (Retailer ⇄ Manufacturer). Everything else is a standard marketing page. Build the toggle as a Component with two Variants (see §5).

**The signature element:** the dark "live determination" card in the hero — a stack of SKUs resolving to ELIGIBLE / LMN / INELIGIBLE with a citation + confidence. Keep this as the visual hero; don't replace it with a generic image.

---

## 1. Assets

| Asset | File | Notes |
|---|---|---|
| Logo (gradient `dayliiIQ™`) | `daylii_logo.png` (2400×516, transparent) | Use at ~24px height in nav, ~22px in footer. Gradient is baked into the PNG. |
| Source of truth | `dayliiIQ_Landing_Page.html` | Open in browser; inspect for exact CSS values. |

Fonts are standard Google Fonts (see §2) — all three are available natively in Framer's font picker, no upload needed.

---

## 2. Design tokens

### Color

| Token | Hex | Use |
|---|---|---|
| Navy | `#0b1733` | Dark sections (proof, footer), determination card |
| Navy 2 / 3 | `#0F2147` / `#173362` | CTA box gradient |
| Brand Blue | `#307FE2` | Primary accent, retailer color, buttons, links |
| Deep Blue | `#1F5CB8` | Button hover |
| Cyan | `#40C8F0` | Atmospheric glows, dividers, mono dots |
| Lime | `#D6FB00` | CTA button on navy, proof headline accent |
| Green (verdict / manufacturer) | `#1B9E5A` | "Eligible" + manufacturer audience accent |
| Amber (verdict) | `#B7791F` | "LMN required" |
| Red (verdict) | `#C0392B` | "Ineligible" |
| Ink | `#0a0a0a` | Primary text |
| Paper | `#fbfcfe` | Page background |
| Line | `#e7ebf2` | Borders / hairlines |
| Gray 400 / 500 / 600 / 700 | `#9aa3b2` / `#6b7382` / `#4c5462` / `#343b47` | Muted text, labels, body |

**Pill colors on dark (determination card)** — text on a tinted chip:
- Eligible: text `#6fe6a6` on `rgba(27,158,90,.16)`
- LMN required: text `#ffd27a` on `rgba(183,121,31,.18)`
- Ineligible: text `#ff9b8e` on `rgba(192,57,43,.16)`

**Signature gradient** (logo + proof stat numbers): `linear-gradient(90deg, #E0A92E 0%, #D6FB00 48%, #40C8F0 100%)` — gold → lime → cyan. Used as text-fill on the big proof numbers and as the small dot before each "Why" feature.

### Typography

All three are on Google Fonts (built into Framer):

| Role | Family | Notes |
|---|---|---|
| Display | **Source Serif 4** | Weight 700. All headlines, value-card / step titles, big proof numbers. The two-tone headline (ink line + colored line) is the core type move. |
| Body | **Geist** | 400 / 500 / 600. Body copy, ledes, buttons, nav. |
| Utility / data | **Geist Mono** | 600. Eyebrows, section labels, the determination-card fields (product meta, citations, confidence), regulation strip. Always UPPERCASE with wide letter-spacing for eyebrows/labels. |

**Type scale** (desktop):

| Style | Family / weight | Size | Line-height | Tracking / case |
|---|---|---|---|---|
| Eyebrow | Geist Mono 600 | 11px | — | `.18em`, UPPERCASE, Brand Blue |
| H1 (hero) | Source Serif 4 700 | clamp 38→58px | 1.04 | `-0.018em` |
| Hero lede | Geist 400 | 18px | 1.55 | Gray 600 (bold spans → Ink) |
| H2 (section) | Source Serif 4 700 | clamp 28→40px | 1.10 | `-0.01em` |
| Section intro | Geist 400 | 17px | 1.5 | Gray 600 |
| Value card title | Source Serif 4 700 | 21px | 1.18 | — |
| Step title | Source Serif 4 700 | 22px | — | — |
| Proof stat (big) | Source Serif 4 700 | clamp 40→60px | 1.0 | gradient text-fill |
| Nav link | Geist 500 | 14px | — | Gray 600 |
| Button | Geist 600 | 14.5px | — | — |
| Determination product | Geist 600 | 14px | — | `#eaf0fb` on navy |
| Determination meta | Geist Mono 400 | 10px | — | `#8ea2c4` |
| Pill | Geist Mono 600 | 9.5px | — | `.06em` |

### Spacing, radius, shadow

- **Content max-width:** 1180px, centered, 28px side padding.
- **Section vertical padding:** 86px desktop (≈54–64px on phone).
- **Hero grid:** two columns `1.04fr / 0.96fr`, 54px gap → stacks at tablet.
- **Radii:** determination card 18px · value cards 14px · buttons 9px · CTA box 22px.
- **Shadows:** card `0 30px 70px -22px rgba(11,23,51,.55)` · primary button `0 4px 14px rgba(48,127,226,.28)` · value-card hover `0 16px 36px -20px rgba(11,23,51,.3)`.

---

## 3. Breakpoints

| Framer breakpoint | Width | Behavior |
|---|---|---|
| Desktop | 1200 | Full two-column hero; 3-col grids. |
| Tablet | 810 | Hero stacks to one column (card below copy); 3-col grids → 1 col; nav text links hide, keep logo + "Book a demo". |
| Phone | 390 | Same single-column; tighten section padding to ~54px; type scales via the clamp values above. |

(The HTML collapses at 920px — map that to Framer's Tablet.)

---

## 4. Section-by-section build

Order top to bottom. Each is a full-width section with the 1180px centered content stack.

**1) Nav** — sticky, translucent white (`rgba(251,252,254,.82)` + blur), 1px bottom border (Line), 64px tall. Left: logo (links to top). Right: text links — *How it works · Who it's for · Proof* — then primary button **Book a demo**. Tablet/phone: hide text links, keep logo + button.

**2) Hero** — two-column. Soft cyan radial glow in the top-right behind everything.
- *Left:* Eyebrow `FSA / HSA · Medicare OTC · Eligibility engine` → H1 (two lines, line 2 Brand Blue) → lede → segmented toggle → audience line (swaps with toggle) → button row (Book a demo + ghost "See how it works").
- *Right:* the **determination card** (see below).

**Determination card (signature):** navy rounded panel (radius 18, the big shadow). Header row: serif `daylii` + gradient `IQ`, and a mono tag `SKU Eligibility · Live determination`, divider under it. Then 4 rows, each: product name (left) + verdict pill (right), and a mono meta line under it. Rows:
| Product | Verdict | Meta |
|---|---|---|
| Flonase Allergy Relief 24HR | Eligible (green) | IRS §213(d) · CARES Act · confidence 0.98 |
| Neutrogena Sunscreen SPF 50 | Eligible (green) | IRS §213(d) · SPF 15+ sun care · confidence 0.96 |
| Benefiber Fiber Powder | LMN required (amber) | IRS §213(d) · dietary supplement · confidence 0.71 |
| Sensodyne Pronamel Toothpaste | Ineligible (red) | general health · not medically necessary · confidence 0.93 |

Pill = small stack: a 6px dot + label, on the tinted chip background (see §2).

**3) Regulation strip** — full-width white band, 1px top/bottom borders. One row: mono label `GROUNDED IN`, then `IRS §213(d) · CARES Act §3702 · CMS MCM Ch. 4 · SIGIS / IIAS standards` with cyan middots. Wraps on phone.

**4) Value section (TOGGLED)** — white. Contains two variants that swap with the toggle:
- *Retailer:* eyebrow "For retailers" → H2 "Recover the eligible basket. / **Stand up to the audit.**" (line 2 Brand Blue) → intro → 3 cards.
- *Manufacturer:* eyebrow "For manufacturers" (green) → H2 "Unlock the FSA/HSA dollars / **your catalog is missing.**" (line 2 Green) → intro → 3 cards. Card eyebrows use Green here instead of Blue.
- Cards: 3-col grid, rounded 14, Paper bg, hairline border, hover lift. Each = small mono eyebrow + serif title + body. (Copy in §7.)

**5) How it works** — Paper bg. Eyebrow → H2 "Catalog in. **Cited eligibility out.**" → intro → a 3-column step row with a 2px ink rule across the top and hairline dividers between columns. Steps are a real sequence, so the `01 · / 02 · / 03 ·` numbering stays. (Copy in §7.)

**6) Proof band** — navy, white text, cyan radial glow top-right. Mono label "Proof point" → H2 with a lime accent phrase → a 3-up stat row: each stat = big gradient number + caption. Then a smaller note line below. (Copy in §7.)

**7) Why dayliiIQ** — white. Eyebrow → H2 "Not a list. **A living eligibility engine.**" → 3-col grid of 6 features, each with a small gradient dot before the title + one line. (Copy in §7.)

**8) CTA** — Paper bg containing one navy→navy3 gradient box (radius 22), lime radial glow bottom-right. Left: H2 + paragraph. Right: **lime** "Book a demo" button (navy text) + "or email hello@daylii.com". This is the only lime button — keep it the loudest thing on the page.

**9) Footer** — navy. Left: logo + one-line tagline. Right: three link columns (Product / Who it's for / Get started). Bottom: hairline + fine-print line with dynamic year.

---

## 5. Interactions & motion

**Audience toggle (the key build):**
- Recommended Framer approach: make the **Value section a Component with two Variants** — `Retailer` and `Manufacturer`. The two segmented-control buttons each have a **Set Variant** interaction (tap → switch the value component's variant). Set the hero audience line as part of the same swap (either inside the same component, or a second small component variant driven by the same control).
- Alternative: use a Framer **Variable** (e.g. `audience = retailer | manufacturer`) and bind both the value block and the hero line to it.
- Active toggle button style: white fill + subtle shadow; inactive: transparent, gray text. Track is `#eef2f8` with a 1px border, 11px radius, 4px inner padding.
- Default = Retailer.

**Hover:** nav links → Ink; primary button → Deep Blue + lift 1px; value cards → lift 3px + shadow; lime CTA → slightly brighter lime.

**Load / scroll motion (subtle, optional):**
- Determination-card rows: fade-in-up, staggered ~0 / 0.25 / 0.45 / 0.65s (Framer "Appear" animation on the card's row stack with stagger).
- A thin lime gradient bar sweeps top→bottom across the card once on load (~2.6s, then gone). Build as a narrow gradient frame with an appear animation moving its Y. Skip if it complicates the build — the staggered rows alone read well.
- Keep motion minimal; honor reduced-motion preferences.

---

## 6. Framer build tips

- **Fonts:** Geist, Geist Mono, Source Serif 4 are all in Framer's Google-Fonts picker. Create Text Styles for each row in the §2 type scale so headings stay consistent across breakpoints.
- **Layout:** build every section with Stacks (auto-layout). Use the 1180px centered content stack inside full-width section frames.
- **Two-tone headlines:** one Text layer with two styled spans, or two stacked Text layers (line 1 Ink, line 2 colored). The colored line color changes by section (Blue in hero/value-retailer/why, Green in value-manufacturer).
- **Gradient text** (proof numbers, logo `IQ`): Framer supports gradient text fills, or bake as an image if needed.
- **Don't** rebuild the determination card as a screenshot — keep it as live layers so it stays crisp and editable.

---

## 7. Copy deck (paste-ready)

**Nav:** How it works · Who it's for · Proof · [Book a demo]

**Hero**
- Eyebrow: `FSA / HSA · Medicare OTC · Eligibility engine`
- H1 line 1: `The eligibility layer`
- H1 line 2 (blue): `for FSA & HSA commerce.`
- Lede: `dayliiIQ classifies every SKU — eligible, ineligible, or letter-of-medical-necessity — each with an IRS §213(d) citation, a confidence score, and plain-English reasoning. Always current. Built to hold up in an audit.`
- Toggle buttons: `I'm a retailer` / `I'm a manufacturer`
- Audience line (retailer): `For retailers: recover the eligible basket and stand up to the audit.`
- Audience line (manufacturer): `For manufacturers: unlock the FSA/HSA dollars your catalog is leaving behind.`
- Buttons: `Book a demo` / `See how it works`

**Regulation strip:** `GROUNDED IN` — `IRS §213(d)` · `CARES Act §3702` · `CMS MCM Ch. 4` · `SIGIS / IIAS standards`

**Value — Retailer**
- Eyebrow: `For retailers`
- H2: `Recover the eligible basket.` / `Stand up to the audit.`
- Intro: `Every FSA/HSA-eligible SKU wrongly declined at checkout is a sale you've already lost — and every over-claim is audit exposure. dayliiIQ closes both gaps.`
- Card 1 — `Lost sales` / `Stop declining eligible items` / `Eligible SKUs that get rejected at checkout are revenue walking out the door. dayliiIQ flags every one so the eligible basket actually converts.`
- Card 2 — `Audit risk` / `Make every verdict defensible` / `Over-claims become liability under audit. Each determination is tied to an IRS citation, scored, and reasoned — a record that holds up.`
- Card 3 — `Operations` / `Retire the manual layer` / `Replace static SIGIS lists, spreadsheets, and outside consultants with one engine that re-grades itself as the rules move.`

**Value — Manufacturer**
- Eyebrow: `For manufacturers`
- H2: `Unlock the FSA/HSA dollars` / `your catalog is missing.`
- Intro: `Your eligible products only sell on tax-advantaged dollars if they're recognized as eligible. Most brands leave that money on the table. dayliiIQ changes that — SKU by SKU.`
- Card 1 — `Recognition` / `Get certified eligible` / `We classify your catalog so eligible products are recognized at checkout and on FSA/HSA marketplaces — not silently declined.`
- Card 2 — `Whitespace` / `Open untapped categories` / `Period care, sun care, acne, postpartum, compression, diagnostics — categories full of eligible SKUs most brands never claim.`
- Card 3 — `Commercials` / `Pay per unlocked SKU` / `You only pay for the SKUs we move into eligible. No platform fee to start — aligned to the catalog we actually open up.`

**How it works**
- Eyebrow: `How it works`
- H2: `Catalog in.` / `Cited eligibility out.`
- Intro: `A low-lift, file-based flow — you send the catalog, we return a determination for every SKU. No API required to get value; an optional read-only API adds live per-SKU lookups at checkout.`
- Step 01 · Determine — `Run the catalog` / `A cited verdict per SKU — eligible, ineligible, or LMN — sets the baseline, with confidence and reasoning on every line.`
- Step 02 · Keep current — `Re-grade as rules move` / `Continuous re-grading as IRS, CARES, FDA, and CMS guidance changes. The layer never goes stale.`
- Step 03 · Audit — `Export the record` / `Every SKU carries a verdict, citation, confidence, and reasoning — one clean record per item, ready for an auditor.`

**Proof band**
- Label: `Proof point`
- H2: `In a pilot with a top US pharmacy retailer, dayliiIQ found` *`money on both sides of the ledger.`* (italic phrase = lime)
- Stat 1: `4,114` — `SKUs analyzed against the retailer's own eligibility tags`
- Stat 2: `44%` — `classified FSA/HSA-eligible across the sample`
- Stat 3: `78` — `discrepancies surfaced vs. the retailer's existing tags`
- Note: `Of those 78: 51 eligible items were under-flagged — recoverable sales — and 27 were over-claims that carried audit risk. Every flag arrived with its citation, confidence, and reasoning attached.`

**Why dayliiIQ**
- Eyebrow: `Why dayliiIQ`
- H2: `Not a list.` / `A living eligibility engine.`
- `Cited to the rule` — `Every verdict ties to IRS §213(d), the CARES Act, FDA monographs, or CMS guidance — never an opinion.`
- `Always current` — `Re-graded continuously as regulations and product data change, so the answer is right today.`
- `Confidence + reasoning` — `Not a black box: each SKU gets a confidence score and plain-English why.`
- `Audit-ready` — `One structured record per SKU — the same answer holds at the shelf, in adjudication, and in front of an auditor.`
- `No PII` — `Runs on catalog data only — never patient data — so security review stays light.`
- `Low-lift to start` — `Secure file transfer, no API required. Add a read-only lookup API only if you adjudicate live at checkout.`

**CTA**
- H2: `See dayliiIQ run on your own catalog.`
- Body: `Send us a sample and we'll return cited determinations — eligible, ineligible, LMN — for every SKU, so you can see exactly what's recoverable and what's at risk.`
- Button: `Book a demo` · `or email hello@daylii.com`

**Footer**
- Tagline: `The cited, always-current eligibility engine for FSA/HSA and Medicare OTC commerce.`
- Columns — Product: How it works / Why dayliiIQ / Proof · Who it's for: Retailers / Manufacturers · Get started: Book a demo / Contact
- Fine print: `© [year] daylii. dayliiIQ provides product-eligibility classification and is not legal or tax advice; final eligibility and reimbursement are governed by the applicable benefit plan and its administrator. Not affiliated with any retailer or manufacturer named or referenced.`

---

## 8. Placeholders to replace before launch

1. **Book a demo** → real booking link (currently `https://cal.com/daylii/demo`).
2. **Email** → real inbox (currently `hello@daylii.com`).
3. **Proof stats** are the real pilot numbers, anonymized to "a top US pharmacy retailer." Confirm you're comfortable publishing them (they're recognizable to that retailer); swap to rounded figures or remove if not.
4. **No lead-capture form** is included — it's a button + email. If you want capture, add a Framer form (name / email / company / "I'm a…" select) wired to your CRM or a form handler.

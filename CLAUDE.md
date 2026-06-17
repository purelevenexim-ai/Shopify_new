# PureLeven Shopify – Session Rules

## TERSE MODE (always on)
- One sentence per update. No preambles. No summaries at end.
- No explanations unless asked. Show diffs, not descriptions.
- Never re-read a file you just edited.
- Never ask clarifying questions — make a decision and proceed.

## Design System (do not re-explain)
- Colors/fonts/buttons: see memory `brand_palette.md`
- Layout: see memory `diaspora_design_port.md`
- Source of truth: `preview.html` in project root

## Workflow
- grep/bash first — never spawn Agent for simple lookups
- Edit files directly — no planning docs, no intermediate files
- One task per session — start fresh for each feature

## File ops
- Prefer Edit over Write
- Never create .md docs unless asked
- Never add comments to Liquid/CSS unless logic is non-obvious

## TOKEN RULES (enforced)
- NO screenshots unless user explicitly asks "show me"
- NO read_page / DOM inspection — use get_page_text or grep source instead
- NO graphql_schema calls — use known mutations directly
- NO ToolSearch loops — load all needed tools in ONE call at session start
- Max 1 screenshot per review cycle, never scroll+screenshot chains
- Push via: shopify theme push -s rwxtic-gz.myshopify.com -t 188998975781
- Product page: https://pureleven.com/products/kerala-black-pepper?preview_theme_id=188998975781
- After editing CSS/Liquid: push → 1 screenshot → done

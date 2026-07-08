# KreoFlow Product Demo

KreoFlow is a product-demo MVP for an AI creative production service that turns one business offer into short video creatives, hooks, captions and a delivery page.

It shows the full service workflow:

- Video-first landing page with a generated hero creative.
- Multi-step client brief with autosave.
- Local AI-style creative plan generation.
- Internal Studio board for statuses and asset links.
- Client delivery gallery with scripts, captions, creative assets and content calendar.
- Demo media assets in `public/media`.

## Run

```bash
pnpm install --ignore-scripts
pnpm dev
```

Open `http://localhost:3000`.

Live GitHub Pages build:

- `https://maks1son.github.io/kreoflow/`

## Main Routes

- `/` - landing page.
- `/brief` - client intake.
- `/studio` - internal production board.
- `/delivery?orderId=rf-demo-beauty` - seeded client gallery.

## Notes

- Data is stored in `localStorage` under `reelsfactory.orders.v1`.
- No real auth, payments, video APIs or AI APIs are connected in v1.
- Heavy video generation is represented as a manual/concierge workflow.
- The local generator in `src/lib/generator.ts` is the future adapter point for OpenAI, Claude or Gemini.
- Internal project documentation lives in local-only `project-docs/`.

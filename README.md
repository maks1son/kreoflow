# ReelsFactory Product Demo

ReelsFactory is a product-demo MVP for an AI creative production service focused on beauty and fitness businesses.

It shows the full service workflow:

- Landing page with a productized offer.
- Multi-step client brief with autosave.
- Local AI-style creative plan generation.
- Internal Studio board for statuses and asset links.
- Client delivery gallery with scripts, captions, creative assets and content calendar.

## Run

```bash
pnpm install --ignore-scripts
pnpm dev
```

Open `http://localhost:3000`.

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
- Project documentation lives in `project-docs/`.
- The current `/` route is an internal prototype only and should not be used as the public launch landing yet.

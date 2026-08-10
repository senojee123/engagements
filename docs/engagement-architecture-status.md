# Engagement Architecture — Implementation Status

Companion to [`engagement-architecture.md`](engagement-architecture.md), which defines the
target design (App ID → Brand-published Instance UUID → iframe embed). This doc checks that
design against what's actually in the codebase today.

## The model (as confirmed with stakeholder)

1. **Developer** builds an engagement and registers it under a stable **App ID**.
2. **Admin** sees every App ID and every Brand's customized versions of it.
3. **Brand** customizes an App (colors, copy, tiles, rules). Each time they publish a change,
   that snapshot mints a new **UUID** — an immutable version record.
4. The published version runs as an **iframe**; the iframe URL (keyed by App ID + Instance
   UUID) is the only thing the **End User** ever sees, via QR code or direct link.

This is exactly what `engagement-architecture.md` already specifies. The question was whether
the implementation matches the spec.

## What's already built

| Piece | Status | Where |
|---|---|---|
| App ID | ✅ Real | `TemplateModel.id` (`lane-daze`, `memory-challenge`, ...) in [`backend/routers/templates.py`](../backend/routers/templates.py) — stable slug per engagement type, served via `/api/templates` as the App catalog. |
| Embed URL routing skeleton | ✅ Real (routes only) | [`src/App.jsx`](../src/App.jsx#L86-L89) already defines `/e/:appId/:instanceId`, `/e/:appId/:instanceId/display`, wired to `InstanceFanRouter` / `InstanceDisplayRouter`. |

## What's missing — the core mechanism isn't built

| Piece | Status | Evidence |
|---|---|---|
| Instance / UUID model | ❌ Does not exist | Grepped all of `backend/` for `Instance` — zero hits. `GameConfigModel` ([`backend/models.py:211`](../backend/models.py#L211)) is the only config table, keyed by `game_id` (the App ID) alone. One row per App, globally — no `brand_id` + minted UUID + Draft/Published status. |
| Publish action that mints a UUID | ❌ Does not exist | No endpoint anywhere snapshots a config and stamps it with a new UUID. `POST /api/game-config/{game_id}` ([`backend/main.py:498`](../backend/main.py#L498)) just overwrites the single global row for that App ID. |
| `instanceId` actually driving content | ❌ Dead parameter | `InstanceFanRouter.jsx` passes `forcedAppId` / `instanceId` props into `FanZoneLanding`, but `FanZoneLanding` ([`src/pages/public/FanZoneLanding.jsx:944`](../src/pages/public/FanZoneLanding.jsx#L944)) is declared with **no props** and ignores both. What actually renders is driven by one single global `ScreenStateModel` row (`main_screen`, [`backend/main.py:125`](../backend/main.py#L125)) — identical for every Brand and every "instance." |
| Developer role | ❌ Does not exist | [`src/constants/roles.js`](../src/constants/roles.js) defines Super Admin, Brand, Marketing Agency, Event Organizer, Venue Manager — no Developer. No gated way to register an App ID today. |
| Admin "Instances" view | ❌ Does not exist | No dashboard groups live sessions by App ID → Brand → Instance UUID. |

## Verdict

The stakeholder's mental model is correct and already fully specified in
`engagement-architecture.md`. What exists in code is:

- the App ID catalog (real), and
- a routing skeleton that *looks* instance-aware but isn't wired to anything (`instanceId` is
  accepted in the URL and then silently dropped).

The piece that makes the whole model actually work — a versioned Instance table that mints a
UUID per Brand publish, and the fan-facing iframe resolving its config by that UUID instead of
a single global screen state — has not been built yet.

## Suggested next step

Implement, in this order (each unblocks the next):

1. `ENGAGEMENT_INSTANCE` table (`instanceId` UUID PK, `appId` FK, `brandId`, `config` JSON,
   `status` Draft/Published/Archived, `createdAt`, `publishedAt`) per the schema already
   defined in `engagement-architecture.md` §3.
2. A publish endpoint: snapshots the Brand's draft config, mints a UUID, marks it `Published`.
3. Wire `FanZoneLanding` (and the display-mode equivalent) to read `appId`/`instanceId` from
   props and fetch that specific Instance's config, instead of the global `ScreenStateModel`.
4. Add `Developer` to `AVAILABLE_ROLES` and gate App creation/schema-editing behind it.
5. Admin "Instances" view: group live/archived Instances by App ID → Brand.

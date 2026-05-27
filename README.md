# Meridian Help Hub — Prototype

A clickable React prototype of a combined Benefits + Pharmacy help center that doubles as onboarding for a new healthcare company. Built as a single self-contained `.jsx` file.

## What it demonstrates

- **Photographic hero** with a duotone/grain fallback (drop in real photo URLs to replace the fallback).
- **Modular, config-driven domains** — Benefits and Pharmacy are defined in a `DOMAINS` array; adding a third domain (e.g. Dental) generates new chips, panels, and search coverage automatically.
- **Per-user providers** — each domain has multiple providers (Insurance A/B, Pharmacy A/B). Provider-specific FAQs only render for the matching provider.
- **Auth state as configuration** — guest vs. signed-in is a single flag that cascades. Guests see an "Account & access" group and provider-agnostic FAQs; members see provider-scoped answers.
- **Hero → detail page routing** — the hero CTA opens a second page rendered from one config-driven article template. Related questions on the detail page link back into the hub.
- **One visibility predicate** — `isVisible(faq, authed, active)` decides what a user sees, so browse and search can never disagree.

A preview-controls strip across the top of the page lets you toggle auth state, hero slot, and active providers to see how the layout responds. That strip is a demo affordance, not product chrome — remove it before shipping.

## Running it locally

This is a single React component, not a project. The fastest way to run it is Vite:

```bash
npm create vite@latest meridian-prototype -- --template react
cd meridian-prototype
npm install
```

Then:

1. Copy `MeridianHubDetail.jsx` into `src/`.
2. Replace the generated `src/App.jsx` with the one in this folder.
3. `npm run dev` — the prototype opens at http://localhost:5173.

No additional dependencies are needed. Fonts load from Google Fonts via an inline `<style>` tag.

## Editing content

All content lives in three arrays at the top of `MeridianHubDetail.jsx`:

- **`DOMAINS`** — the two domain groups and their providers. Add a domain or a provider here and the UI picks it up.
- **`FAQS`** — every question/answer. Each FAQ is tagged with `domain`, optional `provider` (null = applies to anyone in that domain; an id = scoped to one provider), and optional `audience` (`"all"` | `"guest"` | `"member"`).
- **`FEATURED`** — hero slot content. Each entry has a `kind`, hero copy, an optional `image` URL (falls back to a tone-based duotone when null), and a `page` object describing the detail page it routes to.

## Hosting

Vercel or Netlify is the path of least resistance — connect the GitHub repo, they auto-detect Vite, and you get a preview URL on every push.

## What this is and isn't

This is a **prototype** for design and stakeholder review. The FAQ data is hardcoded, routing is component state (not a real router), and there are no tests. Before productionizing, the content arrays should move into a real CMS or content service, the visibility predicate should be unit-tested, and the routing should move to a real router.

<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the devEvent Next.js App Router project. The following changes were made:

- **`instrumentation-client.ts`** (new): Initializes PostHog client-side using the Next.js 15.3+ `instrumentation-client` convention. Enables automatic exception capture and debug logging in development.
- **`next.config.ts`** (updated): Added reverse proxy rewrites so PostHog ingestion requests route through `/ingest/*`, reducing the chance of being blocked by ad blockers. Also set `skipTrailingSlashRedirect: true` as required by PostHog.
- **`components/ExploreBtn.tsx`** (updated): Added `'use client'` directive was already present; imported `posthog-js` and added `posthog.capture('explore_events_clicked')` in the button's click handler.
- **`components/EventCard.tsx`** (updated): Added `'use client'` directive, imported `posthog-js`, and added `posthog.capture('event_card_clicked', { event_title, event_slug, event_location, event_date })` on card link click.
- **`.env.local`** (created/updated): Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables (never hardcoded in source).
- **`package.json`** (updated): `posthog-js` added as a dependency via npm.

| Event Name | Description | File |
|---|---|---|
| `explore_events_clicked` | User clicks the "Explore Events" button to scroll to the events list | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks an event card to view its detail page (includes title, slug, location, date) | `components/EventCard.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/340650/dashboard/1356445
- **Insight — User Engagement: Explore & Event Clicks**: https://us.posthog.com/project/340650/insights/7BKfH2C8
- **Insight — Explore-to-Event Click Conversion Funnel**: https://us.posthog.com/project/340650/insights/apgBhmXn
- **Insight — Most Clicked Events (by Title)**: https://us.posthog.com/project/340650/insights/eSoeDEAQ
- **Insight — Daily Active Users Clicking Events**: https://us.posthog.com/project/340650/insights/5bonSaRG

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

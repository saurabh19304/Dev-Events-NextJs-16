import posthog from "posthog-js";

declare global {
  interface Window {
    __posthogInitialized?: boolean;
  }
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest";

if (typeof window !== "undefined" && POSTHOG_KEY && !window.__posthogInitialized) {
  // Initialize PostHog once on the client; avoids aborted requests during SSR/rehydration.
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: "https://us.posthog.com",
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    // Short timeout prevents lingering requests that surface as AbortErrors on fast navigations.
    request_timeout: 10000,
    debug: process.env.NODE_ENV === "development",
  });

  window.__posthogInitialized = true;
}

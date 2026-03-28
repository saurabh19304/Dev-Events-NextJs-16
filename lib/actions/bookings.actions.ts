"use server"

import  DBconnect  from "../mongodb";
import {Booking} from "@/database";
import { headers } from "next/headers";

const POSTHOG_API_KEY = process.env.POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST ?? "https://us.posthog.com";

// Lightweight server-side PostHog capture to log bookings
const captureBookingEvent = async ({
  email,
  eventId,
  slug,
}: {
  email: string;
  eventId: string;
  slug: string;
}) => {
  if (!POSTHOG_API_KEY) return; // Do not block bookings if analytics key is missing

  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: POSTHOG_API_KEY,
        event: "event_booked",
        distinct_id: email,
        properties: {
          email,
          eventId,
          slug,
          source: "booking_action",
          user_agent: headers().get("user-agent") ?? undefined,
        },
      }),
    });
  } catch (err) {
    console.warn("[posthog] capture event_booked failed", err);
  }
};

export const createBooking = async ({eventId , slug, email} : {eventId : string, slug: string, email: string}) => {
    try {
        await DBconnect();
        const booking = await Booking.create({eventId , slug, email});
        // Fire-and-forget analytics; do not block on PostHog
        captureBookingEvent({ email, eventId, slug }).catch(() => {});
        return {success: true, booking};
    }catch (e) {
        console.log('create booking failed', e)
        return {success: false, error: e}
    }
}
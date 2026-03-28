import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import dbConnect from "@/lib/mongodb";
import { Booking } from "@/database";

const POSTHOG_API_KEY = process.env.POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST ?? "https://us.posthog.com";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface BookingPayload {
  eventId: string;
  slug: string;
  email: string;
}

const captureEventBooked = async ({ email, eventId, slug }: BookingPayload) => {
  if (!POSTHOG_API_KEY) return;

  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_API_KEY,
        event: "event_booked",
        distinct_id: email,
        properties: {
          email,
          eventId,
          slug,
          source: "booking_api",
          user_agent: headers().get("user-agent") ?? undefined,
        },
      }),
    });
  } catch (error) {
    console.warn("[posthog] capture event_booked failed", error);
  }
};

export async function POST(req: NextRequest) {
  try {
    const { eventId, slug, email } = (await req.json()) as Partial<BookingPayload>;

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json({ message: "eventId is required" }, { status: 400 });
    }
    if (!slug || typeof slug !== "string" || !SLUG_REGEX.test(slug)) {
      return NextResponse.json({ message: "Valid slug is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
    }

    await dbConnect();

    const normalizedSlug = slug.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const booking = await Booking.create({
      eventId,
      slug: normalizedSlug,
      email: normalizedEmail,
    });

    void captureEventBooked({ eventId, slug: normalizedSlug, email: normalizedEmail });

    return NextResponse.json(
      { message: "Booking created", bookingId: booking._id, slug: booking.slug },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error("[booking] failed", error);
    return NextResponse.json({ message: "Booking failed" }, { status: 500 });
  }
}


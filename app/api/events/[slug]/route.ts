import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";

/** Shape of the JSON body returned on error responses. */
interface ErrorResponse {
  message: string;
}

/** Shape of the JSON body returned on success. */
interface EventResponse {
  event: IEvent;
}

/**
 * GET /api/events/[slug]
 *
 * Fetches a single event document by its unique `slug`.
 *
 * @param _req  - Incoming Next.js request (unused but required by the signature).
 * @param context - Route context containing the dynamic `slug` param.
 *
 * Status codes:
 *  200 – Event found and returned.
 *  400 – `slug` is missing or not a non-empty string.
 *  404 – No event matches the provided `slug`.
 *  500 – Unexpected server / database error.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<EventResponse | ErrorResponse>> {
  // ── 1. Resolve and validate the route parameter ───────────────────────────
  // In Next.js 15+, params is a Promise and must be awaited before use.
  const { slug } = await context.params;

  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    return NextResponse.json<ErrorResponse>(
      { message: "A valid slug is required." },
      { status: 400 }
    );
  }

  const sanitisedSlug = slug.trim().toLowerCase();

  try {
    // ── 2. Connect to MongoDB ───────────────────────────────────────────────
    await dbConnect();

    // ── 3. Query the database ───────────────────────────────────────────────
    const event = await Event.findOne({ slug: sanitisedSlug }).lean<IEvent>();

    // ── 4. Handle "not found" ───────────────────────────────────────────────
    if (!event) {
      return NextResponse.json<ErrorResponse>(
        { message: `No event found with slug: "${sanitisedSlug}".` },
        { status: 404 }
      );
    }

    // ── 5. Return the event ─────────────────────────────────────────────────
    return NextResponse.json<EventResponse>({ event }, { status: 200 });
  } catch (error) {
    // ── 6. Handle unexpected errors ─────────────────────────────────────────
    console.error("[GET /api/events/[slug]] Unexpected error:", error);

    return NextResponse.json<ErrorResponse>(
      {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected server error occurred.",
      },
      { status: 500 }
    );
  }
}

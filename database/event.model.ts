import mongoose, { Schema, Document, Model } from "mongoose";

// TypeScript interface for the Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    slug: { type: String, unique: true, index: true },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },
    image: { type: String, required: [true, "Image URL is required"] },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: { type: String, required: [true, "Date is required"] },
    time: { type: String, required: [true, "Time is required"], trim: true },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be online, offline, or hybrid",
      },
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  { timestamps: true } // Auto-generates createdAt and updatedAt
);

/**
 * Pre-save hook:
 * 1. Generates a URL-friendly slug from the title (only when title changes).
 * 2. Normalises the date to ISO format (YYYY-MM-DD).
 * 3. Normalises the time to a consistent 12-hour format.
 */
EventSchema.pre("save", function () {
  // --- Slug generation ---
  // Only regenerate if the title has been modified (or is new)
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Strip non-alphanumeric characters
      .replace(/\s+/g, "-") // Replace whitespace with hyphens
      .replace(/-+/g, "-"); // Collapse consecutive hyphens
  }

  // --- Date normalisation ---
  // Convert any parseable date string to ISO format (YYYY-MM-DD)
  if (this.isModified("date")) {
    const parsed = new Date(this.date);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date format: "${this.date}"`);
    }
    this.date = parsed.toISOString().split("T")[0]; // e.g. "2024-03-15"
  }

  // --- Time normalisation ---
  // Ensure time is stored in a consistent "HH:MM AM/PM" format
  if (this.isModified("time")) {
    const timeStr = this.time.trim();

    // Match patterns like "9:00 AM", "14:30", "2:00PM"
    const match12 = timeStr.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );
    const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);

    if (match12) {
      // Already 12-hour — normalise spacing and case
      const hours = parseInt(match12[1], 10);
      const minutes = match12[2];
      const period = match12[3].toUpperCase();
      this.time = `${hours}:${minutes} ${period}`;
    } else if (match24) {
      // Convert 24-hour to 12-hour
      let hours = parseInt(match24[1], 10);
      const minutes = match24[2];
      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      this.time = `${hours}:${minutes} ${period}`;
    }
    // Other formats (e.g. "48 Hours") are kept as-is
  }

  // --- Required-field whitespace validation ---
  const requiredStrings: (keyof IEvent)[] = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer",
  ];

  for (const field of requiredStrings) {
    const value = this[field];
    if (typeof value === "string" && value.trim().length === 0) {
      throw new Error(`${field} must not be empty`);
    }
  }
});

// Prevent model re-compilation during hot-reloads
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;

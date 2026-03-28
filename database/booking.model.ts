import mongoose, { Schema, Document, Model, Types } from "mongoose";
import Event from "./event.model";

// TypeScript interface for the Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  slug: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Standard email regex for format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true, // Index for faster lookups by event
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      lowercase: true,
      index: true, // Index for faster lookups by event slug
      validate: {
        validator: (v: string) => SLUG_REGEX.test(v),
        message: "Slug must be a valid kebab-case value",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: "Email must be a valid email address",
      },
    },
  },
  { timestamps: true } // Auto-generates createdAt and updatedAt
);

/**
 * Pre-save hook:
 * Verifies that the referenced eventId corresponds to an existing Event.
 * Throws an error if the event does not exist to maintain referential integrity.
 */
BookingSchema.pre("save", async function () {
  // Only validate eventId when it has been set or modified
  if (this.isModified("eventId")) {
    const Event = mongoose.model("Event");
    const eventExists = await Event.exists({ _id: this.eventId });

    if (!eventExists) {
      throw new Error(`Event with ID "${this.eventId}" does not exist`);
    }
  }
});

// Prevent model re-compilation during hot-reloads
const Booking: Model<IBooking> =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;

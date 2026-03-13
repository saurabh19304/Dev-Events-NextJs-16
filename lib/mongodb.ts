import mongoose, { type Connection } from "mongoose";

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Cached connection interface.
 * - `conn`: the active Mongoose connection (null if not yet connected)
 * - `promise`: the in-flight connection promise (null if no attempt started)
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

/**
 * Extend the Node.js global type to store the Mongoose cache.
 * This prevents the connection from being recreated on every
 * hot-reload during development.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Reuse the cached connection if available, otherwise initialise it
const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

// Persist the cache on the global object so it survives hot-reloads
global.mongooseCache = cached;

/**
 * Returns a cached Mongoose connection. Creates a new connection
 * only if one doesn't already exist or isn't in progress.
 */
async function dbConnect(): Promise<Connection> {
  // Return the existing connection immediately if available
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection attempt is in progress, start one
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string, {
        bufferCommands: false, // Disable command buffering for predictable error handling
      })
      .then((m) => m.connection);
  }

  // Await the connection and cache it
  try {
        cached.conn = await cached.promise;
     } catch (error) {
        cached.conn = null;
       cached.promise = null;
       throw error;
     }
  return cached.conn;
}

export default dbConnect;

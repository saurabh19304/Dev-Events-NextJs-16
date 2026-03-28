"use server";

import DBconnect from "../mongodb"
import Event from "@/database/event.model";
export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await DBconnect();
        const event = await Event.findOne({ slug }).lean();
        const similarEvents = await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags }
        }).lean();

        // convert _id to string for each event
        return similarEvents.map(event => ({
            ...event,
            _id: event._id.toString(),
            createdAt: event.createdAt.toString(),
            updatedAt: event.updatedAt.toString(),
        }));

    } catch (error) {
        return [];
    }
};
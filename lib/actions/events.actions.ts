"use server";

import DBconnect from "../mongodb"
import Event from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await DBconnect();
 const event = await Event.findOne({ slug }).lean();
return await Event.find({
         _id : { $ne: event._id}, tags: { $in: event.tags}
}).lean();
    }catch (error) {
        return [];
    }
};
import {NextRequest, NextResponse} from "next/server";
import {v2 as cloudinary} from "cloudinary";
import dbConnect from "@/lib/mongodb";
import  Event from "@/database/event.model"

export async function POST(req: NextRequest){
    try {
        await  dbConnect();
        const formData = await req.formData();

        let event;
        try {
            event = Object.fromEntries(formData.entries());

            // fix tags — split comma separated string into clean array
            if(event.tags && typeof event.tags === "string"){
                event.tags = event.tags.split(",").map((t: string) => t.replace(/"/g, "").trim());
            }

        }catch (e) {
return NextResponse.json({ message: "invalid form data" }, { status: 400 })
        }

        const file = formData.get('image') as File;
if(!file) {
    return NextResponse.json({message: "image file is required"}, {status: 400})
}

const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

  const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvents'}, (error , results) => {
          if(error) return reject(error);
          return resolve(results);
      }).end(buffer);
        });

  event.image = (uploadResult as {secure_url : string}).secure_url;

        const createdEvent = await Event.create(event);
         return NextResponse.json({ message: "event created successfully", event: createdEvent }, { status: 201 })
    }catch (e){
        console.error(e);
return NextResponse.json({ message: "event creation failed" , error: e instanceof Error ? e.message : "unknown"} )
    }
}

export async function GET(){
    try {
await dbConnect();

const events = await Event.find().sort({createdAt: -1});
return NextResponse.json({message: "Event fetched successfully", events},{status: 200});
    }catch (e) {
        return NextResponse.json({message: 'Event fetchng failed', error: e}, {status: 500})
    }
}
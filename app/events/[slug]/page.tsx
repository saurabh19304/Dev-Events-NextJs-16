import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvents from "@/components/BookEvents";
import {getSimilarEventsBySlug} from "@/lib/actions/events.actions";
import {IEvent} from "@/database";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Shape of the event the page expects from the API
interface EventDto {
  description: string;
  overview: string;
  image: string;
  date: string;
  time: string;
  location: string;
  mode: string;
  audience: string;
  organizer: string;
  agenda: string[];
  tags: string[];
}

const EventDetailItem = ({
  icon,
  label,
  alt,
}: {
  icon: string;
  label: string;
  alt: string;
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item, idx) => (
        <li key={`${idx}-${item}`}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({tags} : {tags: string[]}) => {
    return (
        <div className="flex flex-row gap-1.5 flex-wrap">
            {tags.map((tag) => (
                <div className="pill" key={tag}>{tag}</div>
            ))}
        </div>
    );
}

// Fetch a single event by slug with basic validation and error handling
const fetchEvent = async (slug: string): Promise<EventDto> => {
  if (!slug || typeof slug !== "string") {
    throw new Error("A valid slug is required");
  }

  if (!BASE_URL) {
    throw new Error("BASE_URL is not configured");
  }

  const response = await fetch(`${BASE_URL}/api/events/${slug}`, {
    // Prevent stale data when navigating between event pages
    cache: "no-store",
  });

  if (response.status === 404) {
    return notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch event details");
  }

  const data = (await response.json()) as { event?: EventDto };

  if (!data.event) {
    throw new Error("Malformed event response");
  }

  return data.event;
};

const eventDetails = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const event = await fetchEvent(slug);
  const {
    description,
    overview,
    image,
    date,
    time,
    location,
    mode,
    audience,
    organizer,
    agenda,
    tags,
  } = event;

  if (!description) return notFound();


  const bookings = 10;

  const similarEvents : IEvent[] = await getSimilarEventsBySlug(slug);


  return (
    <section id="event">
      <div className="header">
        <h1> Event Description </h1>
        <p className="mt-2">{description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image
            src={image}
            alt="Event Banner"
            width={800}
            height={800}
            className="banner"
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2> Events Details</h2>
            <EventDetailItem icon="/icons/calendar.svg" label={date} alt="date" />
            <EventDetailItem icon="/icons/clock.svg" label={time} alt="time" />
            <EventDetailItem icon="/icons/pin.svg" label={location} alt="location" />
            <EventDetailItem icon="/icons/mode.svg" label={mode} alt="mode" />
            <EventDetailItem icon="/icons/audience.svg" label={audience} alt="audience" />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>About the organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={event.tags}/>

        </div>

        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
                <p className="text-sm">
                  Join with {bookings} others who have booked the spot . Don't miss out!
                </p>
            ) : (
                <p className="text-sm">
                    Be the first to book your spot for this event!
                </p>
            )}

            <BookEvents />

          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
            {similarEvents.length > 0 && similarEvents.map((similarEvent : IEvent) => (
                < EventCard key={similarEvent._id} {...similarEvent}/>
            ) )}
        </div>
      </div>

    </section>
  );
};

export default eventDetails;

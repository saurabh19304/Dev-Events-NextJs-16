"use client"  //as we are using the hooks

import { useState } from 'react'
import posthog from "posthog-js";

const BookEvents = ({eventId, slug} : {eventId: string, slug: string}) => {

    const [email, setEmail] = useState('');
    const [Submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);

 if(!email) {
   setError('Email is required');
   return;
 }

 setIsSubmitting(true);

 try {
   const res = await fetch('/api/bookings', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ eventId, slug, email }),
   });

   if(res.ok){
     setSubmitted(true);
     posthog.capture('event_booked', {eventId, slug, email});
   } else {
     const body = await res.json().catch(() => null);
     setError(body?.message ?? 'Booking failed');
   }
 } catch (err) {
   setError('Booking failed');
   posthog.captureException?.(err as Error);
 } finally {
   setIsSubmitting(false);
 }

}

    return (
        <div id="book-event">
            {Submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ): (
                <form onSubmit={handleSubmit}>
                    <div>
                    <label htmlFor="email" >Email Address</label>
                    <input  type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your Email Adress"

                    />
                    </div>

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <button type="submit" className="button-submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</button>
                </form>
            )}
        </div>


    )
}
export default BookEvents

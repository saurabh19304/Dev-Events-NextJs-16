"use client"  //as we are using the hooks

import { useState } from 'react'

const BookEvents = () => {

    const [Email, setEmail] = useState('');
    const [Submitted, setSubmitted] = useState(false);

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();

setTimeout( () => {
    setSubmitted(true);
}, 1000)

}

    return (
        <div id="book-event">
            {Submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ): (
                <form>
                    <div>
                    <label htmlFor="email" >Email Address</label>
                    <input  type="email"
                            value={Email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder="Enter your Email Adress"

                    />
                    </div>

                    <button type="submit" className="button-submit">Submit</button>
                </form>
            )}
        </div>


    )
}
export default BookEvents

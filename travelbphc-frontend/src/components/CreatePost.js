// travelbphc-frontend/src/components/CreatePost.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL_POSTS = 'http://localhost:5000/api/posts';

function CreatePost({ token, currentUserId }) { // Receive currentUserId
    const navigate = useNavigate();
    const [personName, setPersonName] = useState(''); // This might eventually be derived from user profile
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState(''); // YYYY-MM-DD
    const [time, setTime] = useState(''); // HH:MM
    const [leaveTimeStart, setLeaveTimeStart] = useState('00:00'); // NEW: Default to start of day
    const [leaveTimeEnd, setLeaveTimeEnd] = useState('23:59');     // NEW: Default to end of day
    const [lookingForPeople, setLookingForPeople] = useState(0); // NEW: Default to 0
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const getConfig = () => {
        return {
            headers: {
                'x-auth-token': token
            }
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        // Basic validation for time range
        if (leaveTimeStart && leaveTimeEnd && leaveTimeStart > leaveTimeEnd) {
            setError('Start time cannot be after end time.');
            setLoading(false);
            return;
        }
        if (lookingForPeople < 0) {
            setError('Number of people looking for cannot be negative.');
            setLoading(false);
            return;
        }

        try {
            const postData = {
                name: personName, // Consider deriving this from the logged-in user's profile
                origin,
                destination,
                date,
                time,
                leaveTimeStart,   // NEW
                leaveTimeEnd,     // NEW
                lookingForPeople, // NEW
                notes
            };
            await axios.post(API_URL_POSTS, postData, getConfig());
            setSuccessMessage('Post created successfully!');
            // Clear form
            setPersonName('');
            setOrigin('');
            setDestination('');
            setDate('');
            setTime('');
            setLeaveTimeStart('00:00'); // Reset to default
            setLeaveTimeEnd('23:59');   // Reset to default
            setLookingForPeople(0);     // Reset to default
            setNotes('');
            // Optionally navigate after a short delay
            setTimeout(() => navigate('/posts'), 1500);
        } catch (err) {
            console.error('Error creating post:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Create New Travel Post</h2>
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="personName">Your Name:</label>
                    <input
                        type="text"
                        id="personName"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="origin">Origin:</label>
                    <input
                        type="text"
                        id="origin"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="destination">Destination:</label>
                    <input
                        type="text"
                        id="destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="date">Travel Date:</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="time">Preferred Departure Time (e.g., 18:00):</label>
                    <input
                        type="time"
                        id="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                    />
                </div>
                {/* NEW FIELDS */}
                <div>
                    <label htmlFor="leaveTimeStart">Flexible Departure Start Time:</label>
                    <input
                        type="time"
                        id="leaveTimeStart"
                        value={leaveTimeStart}
                        onChange={(e) => setLeaveTimeStart(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="leaveTimeEnd">Flexible Departure End Time:</label>
                    <input
                        type="time"
                        id="leaveTimeEnd"
                        value={leaveTimeEnd}
                        onChange={(e) => setLeaveTimeEnd(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="lookingForPeople">Number of people you are looking for:</label>
                    <input
                        type="number"
                        id="lookingForPeople"
                        value={lookingForPeople}
                        onChange={(e) => setLookingForPeople(Math.max(0, parseInt(e.target.value)))} // Ensure non-negative
                        min="0" // HTML5 min attribute
                        required
                    />
                </div>
                {/* END NEW FIELDS */}
                <div>
                    <label htmlFor="notes">Notes:</label>
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
}

export default CreatePost;
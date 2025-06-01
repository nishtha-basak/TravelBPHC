// travelbphc-frontend/src/components/CreatePost.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL_POSTS = 'http://localhost:5000/api/posts';

function CreatePost({ token }) {
    const navigate = useNavigate();
    const [personName, setPersonName] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
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

        try {
            const postData = { name: personName, origin, destination, date, time, notes };
            await axios.post(API_URL_POSTS, postData, getConfig());
            setSuccessMessage('Post created successfully!');
            // Clear form
            setPersonName('');
            setOrigin('');
            setDestination('');
            setDate('');
            setTime('');
            setNotes('');
            // Optionally, redirect to All Posts page after a short delay
            setTimeout(() => {
                navigate('/posts');
            }, 1500);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create post. Please try again.';
            setError(errorMessage);
            console.error('Create post error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-post-container">
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
                    <label htmlFor="date">Date:</label>
                    <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="time">Time:</label>
                    <input
                        type="time"
                        id="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                    />
                </div>
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
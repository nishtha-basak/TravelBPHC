// travelbphc-frontend/src/components/SearchPosts.js
import React, { useState } from 'react';
import axios from 'axios';

const API_URL_SEARCH_POSTS = 'http://localhost:5000/api/posts/search';

function SearchPosts({ token }) {
    const [searchFormData, setSearchFormData] = useState({
        date: '',
        timeStart: '',
        timeEnd: '',
        origin: '',
        destination: '',
        minSeatsAvailable: '' // Can be empty string or null for optional
    });
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setSearchFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSearchResults([]);

        try {
            const params = {};
            // Only add parameters if they have a value
            if (searchFormData.date) params.date = searchFormData.date;
            if (searchFormData.timeStart) params.timeStart = searchFormData.timeStart;
            if (searchFormData.timeEnd) params.timeEnd = searchFormData.timeEnd;
            if (searchFormData.origin) params.origin = searchFormData.origin;
            if (searchFormData.destination) params.destination = searchFormData.destination;
            // Convert to number if it exists and is not empty
            if (searchFormData.minSeatsAvailable !== '' && searchFormData.minSeatsAvailable !== null) {
                params.minSeatsAvailable = parseInt(searchFormData.minSeatsAvailable);
            }

            const response = await axios.get(API_URL_SEARCH_POSTS, { params });
            setSearchResults(response.data);
        } catch (err) {
            console.error('Error searching posts:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to perform search. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-form-container">
            <h2>Search Travel Posts</h2>
            <form onSubmit={handleSearch}>
                <div>
                    <label htmlFor="searchDate">Travel Date:</label>
                    <input
                        type="date"
                        id="searchDate"
                        name="date"
                        value={searchFormData.date}
                        onChange={handleFormChange}
                    />
                </div>
                <div>
                    <label htmlFor="searchTimeStart">Flexible Start Time:</label>
                    <input
                        type="time"
                        id="searchTimeStart"
                        name="timeStart"
                        value={searchFormData.timeStart}
                        onChange={handleFormChange}
                    />
                </div>
                <div>
                    <label htmlFor="searchTimeEnd">Flexible End Time:</label>
                    <input
                        type="time"
                        id="searchTimeEnd"
                        name="timeEnd"
                        value={searchFormData.timeEnd}
                        onChange={handleFormChange}
                    />
                </div>
                <div>
                    <label htmlFor="searchOrigin">Origin:</label>
                    <input
                        type="text"
                        id="searchOrigin"
                        name="origin"
                        value={searchFormData.origin}
                        onChange={handleFormChange}
                        placeholder="e.g., Bhubaneswar"
                    />
                </div>
                <div>
                    <label htmlFor="searchDestination">Destination:</label>
                    <input
                        type="text"
                        id="searchDestination"
                        name="destination"
                        value={searchFormData.destination}
                        onChange={handleFormChange}
                        placeholder="e.g., Puri"
                    />
                </div>
                <div>
                    <label htmlFor="minSeatsAvailable">Minimum Seats Available:</label>
                    <input
                        type="number"
                        id="minSeatsAvailable"
                        name="minSeatsAvailable"
                        value={searchFormData.minSeatsAvailable}
                        onChange={handleFormChange}
                        min="0"
                        placeholder="e.g., 2"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <p className="error-message" style={{marginTop: '20px'}}>{error}</p>}

            <h3 style={{marginTop: '30px', marginBottom: '15px'}}>Search Results:</h3>
            <div className="posts-list">
                {searchResults.length === 0 && !loading && !error && <p>No posts found matching your criteria.</p>}
                {searchResults.map(post => (
                    <div key={post._id} className="post-card">
                        <h3>{post.origin} to {post.destination}</h3>
                        <p><strong>Name:</strong> {post.name}</p>
                        <p><strong>Travel Date:</strong> {new Date(post.date).toLocaleDateString()}</p>
                        <p><strong>Preferred Time:</strong> {post.time}</p>
                        <p><strong>Flexible Time:</strong> {post.leaveTimeStart} - {post.leaveTimeEnd}</p>
                        {post.lookingForPeople > 0 && (
                            <p>
                                <strong>People Needed:</strong> {post.currentPeopleFound} / {post.lookingForPeople}
                                ({Math.max(0, post.lookingForPeople - post.currentPeopleFound)} slots available)
                            </p>
                        )}
                        {post.notes && <p><strong>Notes:</strong> {post.notes}</p>}
                        <p><small>Posted on: {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}</small></p>
                        {/* Note: In search results, you might not show full comment/like sections
                           or you might show a summary and link to post details page */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SearchPosts;
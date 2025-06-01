// travelbphc-frontend/src/components/Home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL_POSTS = 'http://localhost:5000/api/posts';

// Pass currentUserId as a prop from App.js
function Home({ token, currentUserId }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [personName, setPersonName] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [editingPost, setEditingPost] = useState(null); // State to hold the post being edited

    // Helper to get authorization config
    const getConfig = () => {
        return {
            headers: {
                'x-auth-token': token // Use x-auth-token for your backend
            }
        };
    };

    // Function to fetch posts
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL_POSTS);
            setPosts(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching posts:', err.response?.data || err.message);
            setError('Failed to fetch posts. Please try again.');
            setLoading(false);
        }
    };

    // Initial fetch of posts when component mounts or token changes
    useEffect(() => {
        fetchPosts();
    }, [token]);

    // Handle form submission for creating/updating a post
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const postData = { name: personName, origin, destination, date, time, notes };

            if (editingPost) {
                // Update existing post
                await axios.put(`${API_URL_POSTS}/${editingPost._id}`, postData, getConfig());
                console.log('Post updated successfully!');
            } else {
                // Create new post
                await axios.post(API_URL_POSTS, postData, getConfig());
                console.log('Post created successfully!');
            }

            // Clear form and refetch posts
            setPersonName('');
            setOrigin('');
            setDestination('');
            setDate('');
            setTime('');
            setNotes('');
            setEditingPost(null);
            fetchPosts(); // Refresh the list of posts
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
            setError(errorMessage);
            console.error('Post operation error:', err.response?.data || err.message);
        }
    };

    // Populate form for editing
    const handleEditClick = (post) => {
        setEditingPost(post);
        setPersonName(post.name);
        setOrigin(post.origin);
        setDestination(post.destination);
        setDate(post.date);
        setTime(post.time);
        setNotes(post.notes);
    };

    // Handle deleting a post
    const handleDeletePost = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setError(null);
            try {
                await axios.delete(`${API_URL_POSTS}/${id}`, getConfig());
                console.log('Post deleted successfully!');
                fetchPosts(); // Refresh the list
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to delete post.';
                setError(errorMessage);
                console.error('Delete post error:', err.response?.data || err.message);
            }
        }
    };

    if (loading) return <p>Loading posts...</p>;
    if (error && !posts.length) return <p className="error-message">{error}</p>;

    return (
        <div className="home-container">
            <section className="post-form-section">
                <h2>{editingPost ? 'Edit Travel Post' : 'Create New Travel Post'}</h2>
                {error && <p className="error-message">{error}</p>}
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
                    <button type="submit">
                        {editingPost ? 'Update Post' : 'Create Post'}
                    </button>
                    {editingPost && (
                        <button type="button" onClick={() => {
                            setEditingPost(null);
                            setPersonName('');
                            setOrigin('');
                            setDestination('');
                            setDate('');
                            setTime('');
                            setNotes('');
                        }} className="cancel-button">Cancel Edit</button>
                    )}
                </form>
            </section>

            <hr />

            <section>
                <h2>All Posts</h2>
                {posts.length === 0 ? (
                    <p>No posts available. Be the first to create one!</p>
                ) : (
                    <div className="posts-list">
                        {posts.map(post => (
                            <div key={post._id} className="post-card">
                                <h3>{post.origin} to {post.destination}</h3>
                                <p><strong>Name:</strong> {post.name}</p>
                                <p><strong>Date:</strong> {post.date}</p>
                                <p><strong>Time:</strong> {post.time}</p>
                                {post.notes && <p><strong>Notes:</strong> {post.notes}</p>}

                                {/* Display who posted it for debugging if you want */}
                                {/* <p><small>Posted by: {post.userId.email} (ID: {post.userId._id})</small></p> */}
                                <p><small>Posted on: {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}</small></p>

                                {/* Conditional rendering of Edit/Delete buttons */}
                                {/* FIX IS HERE: Access post.userId._id */}
                                {currentUserId && post.userId && post.userId._id === currentUserId && (
                                    <div className="post-actions">
                                        <button onClick={() => handleEditClick(post)} className="edit-button">Edit</button>
                                        <button onClick={() => handleDeletePost(post._id)} className="delete-button">Delete</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;
// travelbphc-frontend/src/components/Home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL_POSTS = 'http://localhost:5000/api/posts';

function Home({ token }) { // Make sure token is passed as a prop
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add state for the new 'name' field
    const [personName, setPersonName] = useState(''); // State for the name of the person
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [editingPost, setEditingPost] = useState(null); // State to hold the post being edited

    // Function to fetch posts
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            // Include Authorization header for protected routes (if your GET /posts is protected)
            // For now, assuming GET /posts is public as per standard practice, but if it needs auth:
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(API_URL_POSTS, token ? config : {});
            setPosts(response.data);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to fetch posts.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch posts on component mount or token change
    useEffect(() => {
        fetchPosts();
    }, [token]); // Rerun if token changes

    const handleAddPost = async (e) => {
        e.preventDefault();
        setError(null);

        // Basic validation - ensure all required fields are filled
        if (!personName || !origin || !destination || !date || !time) {
            setError('Please fill in all required fields (Name, Origin, Destination, Date, Time).');
            return;
        }

        const newPostData = {
            name: personName, // Include the new name field
            origin,
            destination,
            date,
            time,
            notes
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send the token in the header
                }
            };
            const response = await axios.post(API_URL_POSTS, newPostData, config);
            setPosts([response.data, ...posts]); // Add new post to the top of the list
            
            // Clear form fields after successful submission
            setPersonName('');
            setOrigin('');
            setDestination('');
            setDate('');
            setTime('');
            setNotes('');

        } catch (err) {
            console.error('Error adding post:', err.response ? err.response.data : err.message);
            // Display specific error message from backend if available, otherwise a generic one
            setError(err.response?.data?.message || 'Failed to add post. Please try again.');
        }
    };

    // Handler to set the form into "edit" mode
    const handleEditClick = (post) => {
        setEditingPost(post);
        // Populate the form fields with the data of the post being edited
        setPersonName(post.name || ''); // Use empty string if name is undefined (for older posts)
        setOrigin(post.origin);
        setDestination(post.destination);
        setDate(post.date);
        setTime(post.time);
        setNotes(post.notes);
    };

    // Handler to update an existing post
    const handleUpdatePost = async (e) => {
        e.preventDefault();
        setError(null);

        if (!editingPost) return; // Should not happen if edit button clicked correctly

        // Basic validation for updates
        if (!personName || !origin || !destination || !date || !time) {
            setError('Please fill in all required fields (Name, Origin, Destination, Date, Time).');
            return;
        }

        const updatedPostData = {
            name: personName, // Include the updated name field
            origin,
            destination,
            date,
            time,
            notes
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.put(`${API_URL_POSTS}/${editingPost._id}`, updatedPostData, config);
            
            // Update the posts list with the modified post
            setPosts(posts.map(post => 
                post._id === editingPost._id ? response.data : post
            ));
            
            // Exit edit mode and clear form fields
            setEditingPost(null); 
            setPersonName('');
            setOrigin('');
            setDestination('');
            setDate('');
            setTime('');
            setNotes('');

        } catch (err) {
            console.error('Error updating post:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Failed to update post. Please try again.');
        }
    };

    // Handler to delete a post
    const handleDeletePost = async (id) => {
        setError(null);
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                await axios.delete(`${API_URL_POSTS}/${id}`, config);
                setPosts(posts.filter(post => post._id !== id)); // Remove deleted post from list
            } catch (err) {
                console.error('Error deleting post:', err.response ? err.response.data : err.message);
                setError(err.response?.data?.message || 'Failed to delete post.');
            }
        }
    };

    // Handler to cancel editing a post
    const handleCancelEdit = () => {
        setEditingPost(null);
        // Clear form fields
        setPersonName(''); 
        setOrigin('');
        setDestination('');
        setDate('');
        setTime('');
        setNotes('');
    };

    // Display loading message
    if (loading) return <p>Loading posts...</p>;
    
    // Display error message if fetching posts failed and there are no posts to show
    if (error && !posts.length) return <p className="error-message">{error}</p>;

    return (
        <div className="home-content">
            <section className="post-form-section">
                <h2>{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
                <form onSubmit={editingPost ? handleUpdatePost : handleAddPost}>
                    {/* Display general form error message if any */}
                    {error && <p className="error-message">{error}</p>}
                    
                    {/* Name Field */}
                    <div>
                        <label htmlFor="personName">Name:</label>
                        <input
                            type="text"
                            id="personName"
                            value={personName}
                            onChange={(e) => setPersonName(e.target.value)}
                            required
                        />
                    </div>
                    
                    {/* Origin Field */}
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
                    
                    {/* Destination Field */}
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
                    
                    {/* Date Field */}
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
                    
                    {/* Time Field */}
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
                    
                    {/* Notes Field (Optional) */}
                    <div>
                        <label htmlFor="notes">Notes (Optional):</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                    </div>
                    
                    {/* Submit/Update Button */}
                    <button type="submit">
                        {editingPost ? 'Update Post' : 'Add Post'}
                    </button>
                    
                    {/* Cancel Edit Button (only visible when editing) */}
                    {editingPost && (
                        <button type="button" onClick={handleCancelEdit} className="cancel-edit-button">
                            Cancel Edit
                        </button>
                    )}
                </form>
            </section>

            <hr /> {/* Horizontal rule to separate sections */}

            <section>
                <h2>All Posts</h2>
                {posts.length === 0 ? (
                    <p>No posts available. Be the first to create one!</p>
                ) : (
                    <div className="posts-list">
                        {posts.map(post => (
                            <div key={post._id} className="post-card">
                                <h3>{post.origin} to {post.destination}</h3>
                                <p><strong>Name:</strong> {post.name}</p> {/* Display the new name field */}
                                <p><strong>Date:</strong> {post.date}</p>
                                <p><strong>Time:</strong> {post.time}</p>
                                {post.notes && <p><strong>Notes:</strong> {post.notes}</p>}
                                <p><small>Posted on: {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}</small></p>
                                <div className="post-actions">
                                    <button onClick={() => handleEditClick(post)} className="edit-button">Edit</button>
                                    <button onClick={() => handleDeletePost(post._id)} className="delete-button">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;
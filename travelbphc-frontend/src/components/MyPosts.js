// travelbphc-frontend/src/components/MyPosts.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL_MY_POSTS = 'http://localhost:5000/api/posts/my-posts';
const API_URL_POSTS = 'http://localhost:5000/api/posts'; // For PUT/DELETE operations

function MyPosts({ token, currentUserId }) {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingPost, setEditingPost] = useState(null); // State to hold the post being edited
    const [editFormData, setEditFormData] = useState({
        name: '', origin: '', destination: '', date: '', time: '', notes: ''
    });

    const getConfig = () => {
        return {
            headers: {
                'x-auth-token': token
            }
        };
    };

    const fetchMyPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL_MY_POSTS, getConfig());
            setPosts(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch your posts.';
            setError(errorMessage);
            console.error('Error fetching my posts:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && currentUserId) { // Ensure token and userId are available
            fetchMyPosts();
        }
    }, [token, currentUserId]);

    const handleEditClick = (post) => {
        setEditingPost(post);
        setEditFormData({
            name: post.name,
            origin: post.origin,
            destination: post.destination,
            date: post.date,
            time: post.time,
            notes: post.notes
        });
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await axios.put(`${API_URL_POSTS}/${editingPost._id}`, editFormData, getConfig());
            setEditingPost(null); // Exit edit mode
            fetchMyPosts(); // Refresh posts
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update post.';
            setError(errorMessage);
            console.error('Update post error:', err.response?.data || err.message);
        }
    };

    const handleDeletePost = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setError(null);
            try {
                await axios.delete(`${API_URL_POSTS}/${id}`, getConfig());
                fetchMyPosts(); // Refresh posts
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to delete post.';
                setError(errorMessage);
                console.error('Delete post error:', err.response?.data || err.message);
            }
        }
    };

    if (loading) return <p>Loading your posts...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (posts.length === 0) return <p>You haven't created any posts yet. <button onClick={() => navigate('/posts/create')} className="link-button">Create one now!</button></p>;

    return (
        <div className="my-posts-container">
            <h2>My Posts</h2>
            {editingPost && (
                <section className="post-form-section">
                    <h3>Edit Post: {editingPost.name}</h3>
                    <form onSubmit={handleUpdatePost}>
                        {/* Input fields for edit form, similar to CreatePost */}
                        <div>
                            <label htmlFor="editName">Name:</label>
                            <input type="text" id="editName" name="name" value={editFormData.name} onChange={handleEditFormChange} required />
                        </div>
                        <div>
                            <label htmlFor="editOrigin">Origin:</label>
                            <input type="text" id="editOrigin" name="origin" value={editFormData.origin} onChange={handleEditFormChange} required />
                        </div>
                        <div>
                            <label htmlFor="editDestination">Destination:</label>
                            <input type="text" id="editDestination" name="destination" value={editFormData.destination} onChange={handleEditFormChange} required />
                        </div>
                        <div>
                            <label htmlFor="editDate">Date:</label>
                            <input type="date" id="editDate" name="date" value={editFormData.date} onChange={handleEditFormChange} required />
                        </div>
                        <div>
                            <label htmlFor="editTime">Time:</label>
                            <input type="time" id="editTime" name="time" value={editFormData.time} onChange={handleEditFormChange} required />
                        </div>
                        <div>
                            <label htmlFor="editNotes">Notes:</label>
                            <textarea id="editNotes" name="notes" value={editFormData.notes} onChange={handleEditFormChange}></textarea>
                        </div>
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setEditingPost(null)} className="cancel-button">Cancel</button>
                    </form>
                </section>
            )}

            <div className="posts-list">
                {posts.map(post => (
                    <div key={post._id} className="post-card">
                        <h3>{post.origin} to {post.destination}</h3>
                        <p><strong>Name:</strong> {post.name}</p>
                        <p><strong>Date:</strong> {post.date}</p>
                        <p><strong>Time:</strong> {post.time}</p>
                        {post.notes && <p><strong>Notes:</strong> {post.notes}</p>}
                        {post.userId && post.userId.email && (
                            <p><small>Posted by: {post.userId.email} on: {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}</small></p>
                        )}
                        <div className="post-actions">
                            <button onClick={() => handleEditClick(post)} className="edit-button">Edit</button>
                            <button onClick={() => handleDeletePost(post._id)} className="delete-button">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyPosts;
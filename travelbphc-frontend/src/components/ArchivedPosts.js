// travelbphc-frontend/src/components/ArchivedPosts.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL_ARCHIVED_POSTS = `${process.env.REACT_APP_API_BASE_URL}/api/posts/archived/me`;
 
const API_URL_POSTS = `${process.env.REACT_APP_API_BASE_URL}/api/posts`;


function ArchivedPosts({ token, currentUserId }) {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const getConfig = () => {
        return {
            headers: {
                'x-auth-token': token
            }
        };
    };

    const fetchArchivedPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL_ARCHIVED_POSTS, getConfig());
            setPosts(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch archived posts. Please try again.';
            console.error('Error fetching archived posts:', err.response?.data || err.message);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchArchivedPosts();
    }, [token, navigate]);

    const handleUnarchive = async (postId) => {
        setLoading(true);
        setError(null);
        try {
            await axios.put(`${API_URL_POSTS}/${postId}/unarchive`, {}, getConfig());
            setSuccessMessage('Post unarchived successfully!');
            fetchArchivedPosts(); // Re-fetch posts after unarchive
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Error unarchiving post:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to unarchive post.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading archived posts...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (posts.length === 0) return <p>You have no archived posts.</p>;

    return (
        <div className="archived-posts-container">
            <h2>My Archived Posts</h2>
            {successMessage && <p className="success-message">{successMessage}</p>}
            <div className="posts-list">
                {posts.map(post => (
                    <div key={post._id} className="post-card archived-post"> {/* Use archived-post class */}
                        <h3>{post.origin} to {post.destination} <span className="archived-badge">(Archived)</span></h3>
                        <p><strong>Name:</strong> {post.name}</p>
                        <p><strong>Travel Date:</strong> {new Date(post.date).toLocaleDateString()}</p>
                        <p><strong>Preferred Time:</strong> {post.time}</p>
                        <p><strong>Flexible Time:</strong> {post.leaveTimeStart} - {post.leaveTimeEnd}</p>
                        <p>
                            <strong>People Needed:</strong> {post.currentPeopleFound} / {post.lookingForPeople}
                            ({Math.max(0, post.lookingForPeople - post.currentPeopleFound)} slots available)
                        </p>
                        {post.notes && <p><strong>Notes:</strong> {post.notes}</p>}
                        {post.userId && post.userId.email && (
                            <p><small>Posted by: {post.userId.email} on: {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}</small></p>
                        )}
                        <div className="post-actions">
                            <button onClick={() => handleUnarchive(post._id)} className="unarchive-button">Unarchive</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ArchivedPosts;
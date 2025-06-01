// travelbphc-frontend/src/components/AllPosts.js (formerly Home.js)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL_POSTS = 'http://localhost:5000/api/posts';

function AllPosts({ token, currentUserId }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('createdAt'); // Default sort by creation time
    const [sortOrder, setSortOrder] = useState('desc'); // Default descending (most recent)

    const getConfig = () => {
        return {
            headers: {
                'x-auth-token': token
            }
        };
    };

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            // Include sort parameters in the request
            const response = await axios.get(`${API_URL_POSTS}?sortBy=${sortBy}&order=${sortOrder}`);
            setPosts(response.data);
        } catch (err) {
            console.error('Error fetching posts:', err.response?.data || err.message);
            setError('Failed to fetch posts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [sortBy, sortOrder]); // Re-fetch when sort options change

    const handleLikeToggle = async (postId) => {
        if (!token) {
            setError('You must be logged in to like posts.');
            return;
        }
        try {
            // PUT request to toggle like
            await axios.put(`${API_URL_POSTS}/like/${postId}`, {}, getConfig());
            // Re-fetch posts to get updated like counts
            fetchPosts();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to toggle like.';
            setError(errorMessage);
            console.error('Like toggle error:', err.response?.data || err.message);
        }
    };

    const handleAddComment = async (postId, commentText) => {
        if (!token) {
            setError('You must be logged in to comment on posts.');
            return;
        }
        if (!commentText.trim()) {
            setError('Comment cannot be empty.');
            return;
        }
        try {
            // POST request to add comment
            await axios.post(`${API_URL_POSTS}/comment/${postId}`, { text: commentText }, getConfig());
            // Re-fetch posts to get updated comments
            fetchPosts();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to add comment.';
            setError(errorMessage);
            console.error('Add comment error:', err.response?.data || err.message);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!token) {
            setError('You must be logged in to delete comments.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                // DELETE request to delete comment
                await axios.delete(`${API_URL_POSTS}/comment/${postId}/${commentId}`, getConfig());
                fetchPosts(); // Refresh posts
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to delete comment.';
                setError(errorMessage);
                console.error('Delete comment error:', err.response?.data || err.message);
            }
        }
    };


    if (loading) return <p>Loading posts...</p>;
    if (error && !posts.length) return <p className="error-message">{error}</p>;

    return (
        <div className="all-posts-container">
            <h2>All Travel Posts</h2>
            {error && <p className="error-message">{error}</p>}

            <section className="sort-filter-section">
                <label htmlFor="sort-by">Sort By: </label>
                <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="createdAt">Date Created</option>
                    {/* Add other sort options if your posts have them, e.g., "date" (of travel) */}
                </select>
                <label htmlFor="sort-order">Order: </label>
                <select id="sort-order" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                </select>
            </section>

            {posts.length === 0 ? (
                <p>No posts available yet.</p>
            ) : (
                <div className="posts-list">
                    {posts.map(post => {
                        // Check if current user has liked this post
                        const hasLiked = token && post.likes.some(like => like.user._id === currentUserId);
                        return (
                            <div key={post._id} className="post-card">
                                <h3>{post.origin} to {post.destination}</h3>
                                <p><strong>Name:</strong> {post.name}</p>
                                <p><strong>Date:</strong> {post.date}</p>
                                <p><strong>Time:</strong> {post.time}</p>
                                {post.notes && <p><strong>Notes:</strong> {post.notes}</p>}
                                {post.userId && post.userId.email && (
                                    <p><small>Posted by: {post.userId.email} on: {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}</small></p>
                                )}

                                <div className="post-interactions">
                                    <button
                                        onClick={() => handleLikeToggle(post._id)}
                                        className={`like-button ${hasLiked ? 'liked' : ''}`}
                                        disabled={!token} // Disable if not logged in
                                    >
                                        ❤️ {post.likes.length}
                                    </button>

                                    <div className="comments-section">
                                        <h4>Comments ({post.comments.length})</h4>
                                        <div className="comments-list">
                                            {post.comments.map(comment => (
                                                <div key={comment._id} className="comment-item">
                                                    <p>
                                                        <strong>{comment.user.email}:</strong> {comment.text}
                                                        <small> ({new Date(comment.createdAt).toLocaleDateString()})</small>
                                                        {currentUserId && comment.user._id === currentUserId && (
                                                            <button
                                                                onClick={() => handleDeleteComment(post._id, comment._id)}
                                                                className="delete-comment-button"
                                                            >
                                                                X
                                                            </button>
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        {token && ( // Show comment input only if logged in
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                const commentInput = e.target.elements.commentText;
                                                handleAddComment(post._id, commentInput.value);
                                                commentInput.value = ''; // Clear input
                                            }} className="comment-form">
                                                <input
                                                    type="text"
                                                    name="commentText"
                                                    placeholder="Add a comment..."
                                                    required
                                                />
                                                <button type="submit">Comment</button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AllPosts;
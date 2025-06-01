// travelbphc-frontend/src/components/AllPosts.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL_POSTS = 'http://localhost:5000/api/posts';
const API_URL_COMMENTS = 'http://localhost:5000/api/comments'; // API for comments

// Helper function to build a nested comment tree
const buildCommentTree = (comments, parentId = null) => {
    return comments
        .filter(comment => comment.parentId === parentId)
        .map(comment => ({
            ...comment,
            replies: buildCommentTree(comments, comment._id)
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sort replies by creation time
};

// Helper function to fetch comments for a specific post
const fetchCommentsForPost = async (postId) => {
    try {
        const commentsResponse = await axios.get(`${API_URL_COMMENTS}/${postId}`);
        return commentsResponse.data;
    } catch (commentErr) {
        console.error(`Error fetching comments for post ${postId}:`, commentErr.response?.data || commentErr.message);
        return [];
    }
};

// Recursive Comment component
const CommentItem = ({ comment, token, currentUserId, onCommentDeleted, onReplySubmitted }) => {
    const [replyText, setReplyText] = useState('');
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDeleteComment = async () => {
        if (!window.confirm('Are you sure you want to delete this comment and all its replies?')) {
            return;
        }
        setDeleteLoading(true);
        try {
            await axios.delete(`${API_URL_COMMENTS}/${comment._id}`, {
                headers: {
                    'x-auth-token': token
                }
            });
            onCommentDeleted(comment._id, comment.post); // Pass comment ID and postId
        } catch (err) {
            console.error('Error deleting comment:', err.response?.data || err.message);
            alert('Failed to delete comment. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            await axios.post(
                `${API_URL_COMMENTS}/${comment.post}/${comment._id}/reply`,
                { text: replyText },
                {
                    headers: {
                        'x-auth-token': token
                    }
                }
            );
            onReplySubmitted(comment.post);
            setReplyText('');
            setShowReplyForm(false);
        } catch (err) {
            console.error('Error submitting reply:', err.response?.data || err.message);
            alert('Failed to submit reply. Please try again.');
        }
    };

    return (
        <div className="comment-item-container"> {/* Wrapper for comment and its replies */}
            <div className="comment-content">
                <div className="comment-header">
                    <span className="comment-username">{comment.user ? comment.user.email.split('@')[0] : 'Unknown User'}</span>
                    <span className="comment-text">{comment.text}</span>
                </div>
                <div className="comment-meta">
                    <span className="comment-timestamp">{new Date(comment.createdAt).toLocaleString()}</span>
                    {token && (
                        <div className="comment-actions">
                            {comment.user && comment.user._id === currentUserId && (
                                <button onClick={handleDeleteComment} disabled={deleteLoading} className="comment-action-button delete">
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            )}
                            <button onClick={() => setShowReplyForm(!showReplyForm)} className="comment-action-button reply">
                                {showReplyForm ? 'Cancel' : 'Reply'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {showReplyForm && token && (
                <form onSubmit={handleReplySubmit} className="reply-form">
                    <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.user ? comment.user.email.split('@')[0] : 'comment'}...`}
                        required
                    />
                    <button type="submit">Post</button>
                </form>
            )}
            {comment.replies && comment.replies.length > 0 && (
                <div className="comment-replies"> {/* Dedicated div for replies */}
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            token={token}
                            currentUserId={currentUserId}
                            onCommentDeleted={onCommentDeleted}
                            onReplySubmitted={onReplySubmitted}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


function AllPosts({ token, currentUserId }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('createdAt'); // Default sort by creation time
    const [sortOrder, setSortOrder] = useState('desc'); // Default descending (most recent)
    const [commentText, setCommentText] = useState({}); // State to hold comment text for each post

    const getConfig = useCallback(() => {
        return {
            headers: {
                'x-auth-token': token
            }
        };
    }, [token]);

    const fetchAllPostsAndComments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL_POSTS}?sortBy=${sortBy}&order=${sortOrder}`);
            const fetchedPosts = response.data;

            const postsWithComments = await Promise.all(fetchedPosts.map(async (post) => {
                const comments = await fetchCommentsForPost(post._id);
                return { ...post, comments: buildCommentTree(comments) };
            }));

            setPosts(postsWithComments);
        } catch (err) {
            console.error('Error fetching posts:', err.response?.data || err.message);
            setError('Failed to fetch posts. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortOrder]);

    useEffect(() => {
        fetchAllPostsAndComments();
    }, [fetchAllPostsAndComments]);

    const updateCommentsInPostState = useCallback(async (postId) => {
        const updatedComments = await fetchCommentsForPost(postId);
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId
                    ? { ...post, comments: buildCommentTree(updatedComments) }
                    : post
            )
        );
    }, []);

    const handleAddComment = async (postId, text) => {
        if (!text.trim()) {
            alert('Comment cannot be empty.');
            return;
        }
        try {
            await axios.post(`${API_URL_COMMENTS}/${postId}`, { text }, getConfig());
            await updateCommentsInPostState(postId);
            setCommentText(prev => ({ ...prev, [postId]: '' }));
        } catch (err) {
            console.error('Error adding comment:', err.response?.data || err.message);
            alert('Failed to add comment. Please try again.');
        }
    };

    const handleCommentDeleted = async (commentId, postId) => {
        setPosts(prevPosts =>
            prevPosts.map(post => {
                if (post._id === postId) {
                    const filterComments = (comments) => {
                        return comments.filter(c => {
                            if (c._id === commentId) {
                                return false;
                            }
                            if (c.replies) {
                                c.replies = filterComments(c.replies);
                            }
                            return true;
                        });
                    };
                    return { ...post, comments: filterComments(post.comments) };
                }
                return post;
            })
        );
        try {
            await updateCommentsInPostState(postId);
        } catch (err) {
            console.error('Error re-fetching comments after delete:', err.response?.data || err.message);
            alert('Failed to update comments after deletion. You might need to refresh.');
            fetchAllPostsAndComments();
        }
    };


    const handleLike = async (postId) => {
        try {
            const response = await axios.put(`${API_URL_POSTS}/like/${postId}`, {}, getConfig());
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId ? { ...post, likes: response.data } : post
                )
            );
        } catch (err) {
            console.error('Error liking post:', err.response?.data || err.message);
            alert(err.response?.data?.message || 'Failed to like post.');
        }
    };

    const handleUnlike = async (postId) => {
        try {
            const response = await axios.put(`${API_URL_POSTS}/unlike/${postId}`, {}, getConfig());
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId ? { ...post, likes: response.data } : post
                )
            );
        } catch (err) {
            console.error('Error unliking post:', err.response?.data || err.message);
            alert(err.response?.data?.message || 'Failed to unlike post.');
        }
    };


    if (loading) return <p>Loading posts...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="all-posts-container">
            <h2>All Posts</h2>

            <div className="sort-controls">
                <label htmlFor="sortBy">Sort By:</label>
                <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="createdAt">Most Recent</option>
                    <option value="date">Travel Date</option>
                </select>

                <label htmlFor="sortOrder">Order:</label>
                <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                </select>
            </div>

            {posts.length === 0 ? (
                <p>No posts available. Be the first to create one!</p>
            ) : (
                <div className="posts-list">
                    {posts.map(post => {
                        const hasLiked = post.likes.some(
                            (like) => like.user === currentUserId
                        );
                        const availableSlots = Math.max(0, post.lookingForPeople - post.currentPeopleFound);

                        return (
                            <div key={post._id} className="post-card">
                                <h3>{post.origin} to {post.destination}</h3>
                                <p><strong>Name:</strong> {post.name}</p>
                                <p><strong>Travel Date:</strong> {new Date(post.date).toLocaleDateString()}</p>
                                <p><strong>Preferred Time:</strong> {post.time}</p>
                                <p><strong>Flexible Time:</strong> {post.leaveTimeStart} - {post.leaveTimeEnd}</p>
                                {post.lookingForPeople > 0 && (
                                    <p>
                                        <strong>People Needed:</strong> {post.currentPeopleFound} / {post.lookingForPeople}
                                        ({availableSlots} slots available)
                                    </p>
                                )}
                                {post.notes && <p><strong>Notes:</strong> {post.notes}</p>}
                                {post.userId && post.userId.email && (
                                    <p><small>Posted by: {post.userId.email} on: {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}</small></p>
                                )}

                                <div className="likes-section">
                                    {token && (
                                        hasLiked ? (
                                            <button onClick={() => handleUnlike(post._id)} className="unlike-button">
                                                Unlike ({post.likes.length})
                                            </button>
                                        ) : (
                                            <button onClick={() => handleLike(post._id)} className="like-button">
                                                Like ({post.likes.length})
                                            </button>
                                        )
                                    )}
                                    {!token && (
                                        <p>Likes: {post.likes.length}</p>
                                    )}
                                </div>


                                <div className="comments-section">
                                    <h4>Comments:</h4>
                                    {post.comments && post.comments.length > 0 ? (
                                        <div className="comments-list">
                                            {post.comments.map(comment => (
                                                <CommentItem
                                                    key={comment._id}
                                                    comment={comment}
                                                    token={token}
                                                    currentUserId={currentUserId}
                                                    onCommentDeleted={handleCommentDeleted}
                                                    onReplySubmitted={updateCommentsInPostState}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-comments-message">No comments yet. Be the first to comment!</p>
                                    )}
                                    {token && (
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            handleAddComment(post._id, commentText[post._id] || '');
                                            setCommentText(prev => ({ ...prev, [post._id]: '' }));
                                        }} className="comment-form">
                                            <input
                                                type="text"
                                                name="commentText"
                                                placeholder="Add a comment..."
                                                value={commentText[post._id] || ''}
                                                onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                                                required
                                            />
                                            <button type="submit">Post</button>
                                        </form>
                                    )}
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
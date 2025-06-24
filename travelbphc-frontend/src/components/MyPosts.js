// travelbphc-frontend/src/components/MyPosts.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL_MY_POSTS = `${process.env.REACT_APP_API_BASE_URL}/api/posts/my-posts`; // Will fetch all my posts, including archived ones
const API_URL_POSTS = `${process.env.REACT_APP_API_BASE_URL}/api/posts`;


function MyPosts({ token, currentUserId }) {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); // FIX: Declare successMessage state
    const [editingPost, setEditingPost] = useState(null); // State to hold the post being edited
    const [editFormData, setEditFormData] = useState({
        name: '',
        origin: '',
        destination: '',
        date: '',
        time: '',
        leaveTimeStart: '', // NEW
        leaveTimeEnd: '',   // NEW
        lookingForPeople: 0, // NEW
        currentPeopleFound: 0, // NEW
        notes: '',
        isArchived: false // NEW
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
        setSuccessMessage(null); // Clear success message on new fetch
        try {
            // Fetch all posts, including archived ones, from the user's specific endpoint
            const response = await axios.get(API_URL_MY_POSTS, getConfig());
            setPosts(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch your posts. Please try again.';
            console.error('Error fetching my posts:', err.response?.data || err.message);
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
        fetchMyPosts();
    }, [token, navigate]);

    const handleEditClick = (post) => {
        // Format date for input type="date"
        const formattedDate = post.date ? new Date(post.date).toISOString().split('T')[0] : '';
        setEditingPost(post._id);
        setEditFormData({
            name: post.name,
            origin: post.origin,
            destination: post.destination,
            date: formattedDate,
            time: post.time,
            leaveTimeStart: post.leaveTimeStart || '00:00', // Default if null/undefined
            leaveTimeEnd: post.leaveTimeEnd || '23:59',     // Default if null/undefined
            lookingForPeople: post.lookingForPeople || 0,
            currentPeopleFound: post.currentPeopleFound || 0,
            notes: post.notes,
            isArchived: post.isArchived // Populate current archived status
        });
    };

    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null); // Clear messages before new attempt

        // Basic validation for time range
        if (editFormData.leaveTimeStart && editFormData.leaveTimeEnd && editFormData.leaveTimeStart > editFormData.leaveTimeEnd) {
            setError('Start time cannot be after end time.');
            setLoading(false);
            return;
        }
        if (editFormData.currentPeopleFound > editFormData.lookingForPeople) {
            setError('Current people found cannot exceed people looking for.');
            setLoading(false);
            return;
        }
        if (editFormData.lookingForPeople < 0 || editFormData.currentPeopleFound < 0) {
            setError('People counts cannot be negative.');
            setLoading(false);
            return;
        }
        
         console.log('Attempting to update post with ID:', editingPost); // ADD THIS
        console.log('Update data:', editFormData); // ADD THIS

        try {
            await axios.put(`${API_URL_POSTS}/${editingPost}`, editFormData, getConfig());
            setSuccessMessage('Post updated successfully!');
            setEditingPost(null);
            fetchMyPosts();
        } catch (err) {
            console.error('Error updating post:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to update post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            console.log('Attempting to delete post with ID:', postId); // ADD THIS
            setLoading(true);
            setError(null);
            setSuccessMessage(null);
            try {
                await axios.delete(`${API_URL_POSTS}/${postId}`, getConfig());
                setSuccessMessage('Post deleted successfully!');
                fetchMyPosts();
            } catch (err) {
                console.error('Error deleting post:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to delete post.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleArchiveToggle = async (postId, currentStatus) => {
        console.log(`Attempting to ${currentStatus ? 'unarchive' : 'archive'} post with ID:`, postId); // ADD THIS
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const endpoint = currentStatus ? `${API_URL_POSTS}/${postId}/unarchive` : `${API_URL_POSTS}/${postId}/archive`;
            await axios.put(endpoint, {}, getConfig());
            setSuccessMessage(`Post ${currentStatus ? 'unarchived' : 'archived'} successfully!`);
            fetchMyPosts();
        } catch (err) {
            console.error('Error archiving/unarchiving post:', err.response?.data || err.message);
            setError(err.response?.data?.message || `Failed to ${currentStatus ? 'unarchive' : 'archive'} post.`);
        } finally {
            setLoading(false);
        }
    };

    const handlePeopleCountChange = async (postId, newCount) => {
        console.log('Attempting to update people count for post ID:', postId, 'to', newCount); // ADD THIS
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const postToUpdate = posts.find(p => p._id === postId);
            if (!postToUpdate) {
                setError('Post not found in frontend state.'); // Added for clarity
                setLoading(false);
                return;
            }
            if (newCount < 0 || newCount > postToUpdate.lookingForPeople) {
                setError('Invalid people count. Must be between 0 and "looking for people".');
                setLoading(false);
                return;
            }

            await axios.put(`${API_URL_POSTS}/${postId}/update-people-count`, { currentPeopleFound: newCount }, getConfig());
            setSuccessMessage('People count updated successfully!');
            fetchMyPosts();
        } catch (err) {
            console.error('Error updating people count:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to update people count.');
        } finally {
            setLoading(false);
        }
    };


    if (loading) return <p>Loading your posts...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (posts.length === 0) return <p>You haven't created any posts yet.</p>;

    return (
        <div className="my-posts-container">
            <h2>My Posts</h2>
            {successMessage && <p className="success-message">{successMessage}</p>} {/* FIX: Use successMessage here */}

            {editingPost && (
                <section className="edit-post-section">
                    <h3>Edit Post</h3>
                    <form onSubmit={handleUpdatePost}>
                        <div>
                            <label htmlFor="editName">Your Name:</label>
                            <input
                                type="text"
                                id="editName"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="editOrigin">Origin:</label>
                            <input
                                type="text"
                                id="editOrigin"
                                name="origin"
                                value={editFormData.origin}
                                onChange={handleEditFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="editDestination">Destination:</label>
                            <input
                                type="text"
                                id="editDestination"
                                name="destination"
                                value={editFormData.destination}
                                onChange={handleEditFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="editDate">Date:</label>
                            <input
                                type="date"
                                id="editDate"
                                name="date"
                                value={editFormData.date}
                                onChange={handleEditFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="editTime">Time:</label>
                            <input
                                type="time"
                                id="editTime"
                                name="time"
                                value={editFormData.time}
                                onChange={handleEditFormChange}
                                required
                            />
                        </div>
                        {/* NEW EDIT FIELDS */}
                        <div>
                            <label htmlFor="editLeaveTimeStart">Flexible Departure Start Time:</label>
                            <input
                                type="time"
                                id="editLeaveTimeStart"
                                name="leaveTimeStart"
                                value={editFormData.leaveTimeStart}
                                onChange={handleEditFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="editLeaveTimeEnd">Flexible Departure End Time:</label>
                            <input
                                type="time"
                                id="editLeaveTimeEnd"
                                name="leaveTimeEnd"
                                value={editFormData.leaveTimeEnd}
                                onChange={handleEditFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="editLookingForPeople">Number of people looking for:</label>
                            <input
                                type="number"
                                id="editLookingForPeople"
                                name="lookingForPeople"
                                value={editFormData.lookingForPeople}
                                onChange={handleEditFormChange}
                                min="0"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="editCurrentPeopleFound">Current people found:</label>
                            <input
                                type="number"
                                id="editCurrentPeopleFound"
                                name="currentPeopleFound"
                                value={editFormData.currentPeopleFound}
                                onChange={handleEditFormChange}
                                min="0"
                                max={editFormData.lookingForPeople} // Max based on lookingForPeople
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="checkbox"
                                id="editIsArchived"
                                name="isArchived"
                                checked={editFormData.isArchived}
                                onChange={handleEditFormChange}
                            />
                            <label htmlFor="editIsArchived">Archive Post</label>
                        </div>
                        {/* END NEW EDIT FIELDS */}
                        <div>
                            <label htmlFor="editNotes">Notes:</label>
                            <textarea
                                id="editNotes"
                                name="notes"
                                value={editFormData.notes}
                                onChange={handleEditFormChange}
                            ></textarea>
                        </div>
                        <button type="submit" disabled={loading}>Save Changes</button>
                        <button type="button" onClick={() => setEditingPost(null)} className="cancel-button">Cancel</button>
                    </form>
                </section>
            )}

            <div className="posts-list">
                {posts.map(post => (
                    <div key={post._id} className={`post-card ${post.isArchived ? 'archived-post' : ''}`}>
                        <h3>{post.origin} to {post.destination} {post.isArchived && <span className="archived-badge">(Archived)</span>}</h3>
                        <p><strong>Name:</strong> {post.name}</p>
                        <p><strong>Date:</strong> {new Date(post.date).toLocaleDateString()}</p>
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
                            <button onClick={() => handleEditClick(post)} className="edit-button">Edit</button>
                            <button onClick={() => handleDeletePost(post._id)} className="delete-button">Delete</button>
                            <button
                                onClick={() => handleArchiveToggle(post._id, post.isArchived)}
                                className={post.isArchived ? 'unarchive-button' : 'archive-button'}
                            >
                                {post.isArchived ? 'Unarchive' : 'Archive'}
                            </button>
                            
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyPosts;
// travelbphc-frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // This imports your basic CSS

const API_URL = 'http://localhost:5000/api/posts'; // This is where your backend is running!

function App() {
  // State variables to hold form input and fetched posts
  const [posts, setPosts] = useState([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false); // For showing loading status
  const [error, setError] = useState(null);   // For showing error messages
  const [editingPostId, setEditingPostId] = useState(null); // New state to track editing post
  // Function to fetch all travel posts from the backend
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL); // Make a GET request to your backend
      setPosts(response.data); // Update the posts state with the received data
    } catch (err) {
      setError('Failed to fetch posts. Is the backend server running?');
      console.error('Fetch error:', err); // Log the actual error for debugging
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  };

  // useEffect: Runs once when the component mounts (loads) to fetch initial posts
  useEffect(() => {
    fetchPosts();
  }, []); // Empty dependency array means it runs only once

  // Function to handle form submission (Create OR Update)
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
        const postData = { origin, destination, date, time, notes };

        if (editingPostId) {
            // This is an update operation (PUT request)
            // *** THIS IS THE LINE TO FIX ***
            // Change to use BACKTICKS (`) and proper ${} interpolation
            await axios.put(`${API_URL}/${editingPostId}`, postData); // <-- Corrected line
            alert('Post updated successfully!');
            setEditingPostId(null); // Clear editing state
        } else {
            // Otherwise, it's a new post creation (POST request)
            // This line already looks correct from previous checks, it doesn't have the span tags.
            await axios.post(API_URL, postData);
            alert('Post created successfully!');
        }

        // Clear the form fields after successful submission
        setOrigin('');
        setDestination('');
        setDate('');
        setTime('');
        setNotes('');
        fetchPosts(); // Re-fetch the list to show updated/new posts
    } catch (err) {
        setError(`Failed to ${editingPostId ? 'update' : 'create'} post.`);
        console.error(`${editingPostId ? 'Update' : 'Create'} error:`, err);
    } finally {
        setLoading(false);
    }
};
// Function to handle deleting a post
const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
        return; // User cancelled
    }
    setLoading(true);
    setError(null);
    try {
        // Change the entire string to use BACKTICKS (`)
        // And wrap API_URL and id within ${}
        await axios.delete(`${API_URL}/${id}`); // <-- This is the corrected line
        alert('Post deleted successfully!');
        fetchPosts(); // Re-fetch posts to update the list
    } catch (err) {
        setError('Failed to delete post.');
        console.error('Delete error:', err);
    } finally {
        setLoading(false);
    }
};

// Function to handle editing a post (populates the form)
const handleEdit = (post) => {
    setEditingPostId(post._id); // Set the ID of the post being edited
    // Populate the form fields with the post's current data
    setOrigin(post.origin);
    setDestination(post.destination);
    setDate(post.date); // Date input expects 'YYYY-MM-DD'
    setTime(post.time);
    setNotes(post.notes);
    // Scroll to the top of the page (or form) if needed for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
  return (
    <div className="App">
      <h1>TravelBPHC</h1>

      <section>
        <h2>Create a New Travel Post</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Origin:</label>
            <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
          </div>
          <div>
            <label>Destination:</label>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} required />
          </div>
          <div>
            <label>Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label>Time:</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <div>
            <label>Notes:</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
          </div>
          <button type="submit" disabled={loading}>
  {loading ? 'Submitting...' : (editingPostId ? 'Update Post' : 'Post Ride')}
</button>
{editingPostId && (
        <button type="button" onClick={() => {
            setEditingPostId(null);
            setOrigin('');
            setDestination('');
            setDate('');
            setTime('');
            setNotes('');
        }} className="cancel-edit-button" disabled={loading}>
            Cancel Edit
        </button>
    )}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </section>

      <hr />

      <section>
        <h2>Available Posts</h2>
        {loading && <p>Loading posts...</p>}
        {error && !loading && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && posts.length === 0 && <p>No posts available. Be the first to create one!</p>}
        {!loading && posts.length > 0 && (
          <div className="posts-list">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
    <h3>{post.origin} &rarr; {post.destination}</h3>
    <p><strong>Date:</strong> {new Date(post.date).toLocaleDateString()}</p>
    <p><strong>Time:</strong> {post.time}</p>
    {post.notes && <p><strong>Notes:</strong> {post.notes}</p>}
    <p><small>Posted: {new Date(post.createdAt).toLocaleString()}</small></p>
    <div className="post-actions">
        <button onClick={() => handleEdit(post)} className="edit-button" disabled={loading}>
            Edit
        </button>
        <button onClick={() => handleDelete(post._id)} className="delete-button" disabled={loading}>
            Delete
        </button>
    </div>
</div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
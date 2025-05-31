// travelbphc-frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Correct v5 imports: BrowserRouter as Router, Switch, Route, Link, useHistory
import { BrowserRouter as Router, Switch, Route, Link, useHistory } from 'react-router-dom';
import './App.css';

// Import your new authentication components
import Login from './components/Login';
import Signup from './components/Signup';

// Define your backend API URL for posts
const API_URL_POSTS = 'http://localhost:5000/api/posts';
// Define your backend API URL for auth
const API_URL_AUTH = 'http://localhost:5000/api/auth';

function App() {
    // State variables for posts management (existing)
    const [posts, setPosts] = useState([]);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);

    // NEW State for Authentication
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const history = useHistory(); // Hook for programmatic navigation (correct for v5)

    // Function to fetch all travel posts from the backend (existing)
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL_POSTS}`);
            setPosts(response.data);
        } catch (err) {
            setError('Failed to fetch posts. Is the backend server running?');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // useEffect: Runs once when the component mounts to fetch initial posts
    useEffect(() => {
        fetchPosts();
    }, []);

    // Function to handle form submission (Create OR Update) (existing)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const postData = { origin, destination, date, time, notes };

            if (editingPostId) {
                await axios.put(`${API_URL_POSTS}/${editingPostId}`, postData);
                alert('Post updated successfully!');
                setEditingPostId(null);
            } else {
                await axios.post(`${API_URL_POSTS}`, postData);
                alert('Post created successfully!');
            }

            setOrigin('');
            setDestination('');
            setDate('');
            setTime('');
            setNotes('');
            fetchPosts();
        } catch (err) {
            setError(`Failed to ${editingPostId ? 'update' : 'create'} post.`);
            console.error(`${editingPostId ? 'Update' : 'Create'} error:`, err);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle deleting a post (existing)
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`${API_URL_POSTS}/${id}`);
            alert('Post deleted successfully!');
            fetchPosts();
        } catch (err) {
            setError('Failed to delete post.');
            console.error('Delete error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle editing a post (populates the form) (existing)
    const handleEdit = (post) => {
        setEditingPostId(post._id);
        setOrigin(post.origin);
        setDestination(post.destination);
        setDate(post.date);
        setTime(post.time);
        setNotes(post.notes);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // NEW Authentication Handlers
    const handleLoginSuccess = (token) => {
        localStorage.setItem('token', token); // Store the token
        setIsAuthenticated(true);
        alert('Logged in successfully!');
        history.push('/'); // **Corrected: history.push('/') for v5**
    };

    const handleSignupSuccess = () => {
        alert('Account created successfully! Please log in.');
        history.push('/login'); // **Corrected: history.push('/login') for v5**
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the token
        setIsAuthenticated(false);
        alert('Logged out successfully!');
        history.push('/login'); // **Corrected: history.push('/login') for v5**
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>TravelBPHC</h1>
                <nav>
                    {isAuthenticated ? (
                        <>
                            <Link to="/">Home</Link> | <button onClick={handleLogout} className="link-button">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link> | <Link to="/signup">Sign Up</Link>
                        </>
                    )}
                </nav>
            </header>

            {/* --- CRITICAL CHANGES HERE FOR ROUTING SYNTAX --- */}
            <Switch> {/* Correctly using Switch, not Routes */}
                {/* Route for the main posts page */}
                <Route path="/" exact> {/* The 'exact' prop is on the Route, not inside the render */}
                    <section>
                        <h2>{isAuthenticated ? 'Your Travel Posts' : 'Available Travel Posts'}</h2>
                        {/* Display Create Post Form only if authenticated */}
                        {isAuthenticated && (
                            <section>
                                <h2>{editingPostId ? 'Edit Travel Post' : 'Create a New Travel Post'}</h2>
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
                        )}
                        <hr />
                        <h3>All Posts</h3>
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
                                        {/* Show Edit/Delete buttons only if authenticated */}
                                        {isAuthenticated && (
                                            <div className="post-actions">
                                                <button onClick={() => handleEdit(post)} className="edit-button" disabled={loading}>
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(post._id)} className="delete-button" disabled={loading}>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </Route>

                {/* Route for the Login page */}
                <Route path="/login"> {/* Render children directly */}
                    <Login onLoginSuccess={handleLoginSuccess} />
                </Route>
                {/* Route for the Sign Up page */}
                <Route path="/signup"> {/* Render children directly */}
                    <Signup onSignupSuccess={handleSignupSuccess} />
                </Route>
            </Switch>
        </div>
    );
}

// Wrapper to provide Router context to App component
function AppWrapper() {
    return (
        <Router> {/* BrowserRouter renamed as Router in import */}
            <App />
        </Router>
    );
}

export default AppWrapper;
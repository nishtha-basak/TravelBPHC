// travelbphc-frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Link, Navigate } from 'react-router-dom';
import './App.css';
import { jwtDecode } from 'jwt-decode';

// Import your custom components
import AllPosts from './components/AllPosts';
import CreatePost from './components/CreatePost';
import MyPosts from './components/MyPosts';
import Login from './components/Login';
import Signup from './components/Signup';
import SearchPosts from './components/SearchPosts'; // NEW: Import SearchPosts component
import ArchivedPosts from './components/ArchivedPosts'; // NEW: Import ArchivedPosts component


function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [currentUserId, setCurrentUserId] = useState(null); // State for current user's ID

    const navigate = useNavigate();

    // Function to decode token and set user ID
    const decodeToken = (token) => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUserId(decoded.user.id);
            } catch (error) {
                console.error("Failed to decode token:", error);
                setToken(null);
                localStorage.removeItem('token');
                setCurrentUserId(null);
                navigate('/login');
            }
        } else {
            setCurrentUserId(null);
        }
    };

    // Effect to decode token on component mount or when token changes
    useEffect(() => {
        decodeToken(token);
    }, [token]);

    const handleLoginSuccess = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        navigate('/posts'); // Navigate to posts page after successful login
    };

    const handleSignupSuccess = () => {
        alert('Signup successful! Please login.');
        navigate('/login');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUserId(null);
        navigate('/login');
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>TravelBPHC</h1>
                <nav>
                    <ul>
                        <li><Link to="/posts">All Posts</Link></li>
                        {token && <li><Link to="/posts/create">Create Post</Link></li>}
                        {token && <li><Link to="/my-posts">My Posts</Link></li>}
                        {token && <li><Link to="/search">Search Travel</Link></li>} {/* NEW Nav Link */}
                        {token && <li><Link to="/archived-posts">Archived Posts</Link></li>} {/* NEW Nav Link */}
                        {!token ? (
                            <>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/signup">Sign Up</Link></li>
                            </>
                        ) : (
                            <li>
                                <button onClick={handleLogout} className="link-button">Logout</button>
                            </li>
                        )}
                    </ul>
                </nav>
            </header>

            <main>
                <Routes>
                    <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/signup" element={<Signup onSignupSuccess={handleSignupSuccess} />} />

                    {/* All Posts is accessible by default for viewing, but actions (like/comment) need auth */}
                    <Route path="/posts" element={<AllPosts token={token} currentUserId={currentUserId} />} />

                    {/* Protected Routes for creating, editing, deleting */}
                    <Route
                        path="/posts/create"
                        element={token ? <CreatePost token={token} currentUserId={currentUserId} /> : <Navigate to="/login" replace />} // Pass currentUserId
                    />
                    <Route
                        path="/my-posts"
                        element={token ? <MyPosts token={token} currentUserId={currentUserId} /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/search" // NEW Route for search page
                        element={<SearchPosts token={token} currentUserId={currentUserId} />}
                    />
                     <Route
                        path="/archived-posts" // NEW Route for archived posts
                        element={token ? <ArchivedPosts token={token} currentUserId={currentUserId} /> : <Navigate to="/login" replace />}
                    />
                    {/* Root path redirects to /posts if logged in, otherwise to /login */}
                    <Route path="/" element={token ? <Navigate to="/posts" replace /> : <Navigate to="/login" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
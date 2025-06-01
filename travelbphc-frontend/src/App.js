// travelbphc-frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Link, Navigate } from 'react-router-dom';
import './App.css';
import { jwtDecode } from 'jwt-decode';

// Import your custom components
import AllPosts from './components/AllPosts'; // Renamed Home to AllPosts
import CreatePost from './components/CreatePost'; // New component
import MyPosts from './components/MyPosts';     // New component
import Login from './components/Login';
import Signup from './components/Signup';

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
                // console.log("App.js: Current User ID from token:", decoded.user.id); // Keep for debugging if needed
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

    // Effect to decode token when it changes or on initial load
    useEffect(() => {
        decodeToken(token);
    }, [token]);

    // Redirection logic based on token presence
    useEffect(() => {
        if (token) {
            if (window.location.pathname === '/login' || window.location.pathname === '/signup' || window.location.pathname === '/') {
                navigate('/posts'); // Redirect to /posts if logged in and on auth pages or root
            }
        } else {
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                navigate('/login'); // Redirect to login if not logged in and not on auth pages
            }
        }
    }, [token, navigate]);


    const handleLoginSuccess = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        decodeToken(newToken);
        navigate('/posts'); // Redirect to all posts page
    };

    const handleSignupSuccess = () => {
        navigate('/login');
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setCurrentUserId(null);
        navigate('/login');
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>TravelBPHC</h1>
                <nav>
                    <ul>
                        <li><Link to="/posts">All Posts</Link></li> {/* New link for All Posts */}
                        {token && ( // Show these links only if logged in
                            <>
                                <li><Link to="/posts/create">Create New Post</Link></li> {/* New link for Create Post */}
                                <li><Link to="/my-posts">My Posts</Link></li> {/* New link for My Posts */}
                            </>
                        )}
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
                        element={token ? <CreatePost token={token} /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/my-posts"
                        element={token ? <MyPosts token={token} currentUserId={currentUserId} /> : <Navigate to="/login" replace />}
                    />
                    {/* Root path redirects to /posts if logged in, otherwise to /login */}
                    <Route path="/" element={token ? <Navigate to="/posts" replace /> : <Navigate to="/login" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
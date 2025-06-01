// travelbphc-frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Link, Navigate } from 'react-router-dom';
import './App.css';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [currentUserId, setCurrentUserId] = useState(null); // NEW: State for current user's ID

    const navigate = useNavigate();

    // Function to decode token and set user ID
    const decodeToken = (token) => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Assuming your JWT payload structure is { user: { id: '...' } }
                setCurrentUserId(decoded.user.id);
                console.log("App.js: Current User ID from token:", decoded.user.id); // ADD THIS LINE
            } catch (error) {
                console.error("Failed to decode token:", error);
                // If token is invalid, clear it
                setToken(null);
                localStorage.removeItem('token');
                setCurrentUserId(null);
                navigate('/login');
            }
        } else {
            setCurrentUserId(null);
        }
    };

    // Effect to decode token when it changes
    useEffect(() => {
        decodeToken(token);
    }, [token]);

    // This runs on component mount and whenever 'token' or 'navigate' changes.
    useEffect(() => {
        if (token) {
            if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
                navigate('/');
            }
        } else {
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                navigate('/login');
            }
        }
    }, [token, navigate]);

    const handleLoginSuccess = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        decodeToken(newToken); // Decode the new token
        navigate('/'); // Redirect to home page
    };

    const handleSignupSuccess = () => {
        navigate('/login'); // After signup, redirect to login page
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setCurrentUserId(null); // Clear user ID on logout
        navigate('/login'); // Redirect to login page
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>TravelBPHC</h1>
                <nav>
                    <ul>
                        {!token ? (
                            <>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/signup">Sign Up</Link></li>
                            </>
                        ) : (
                            // Render a button for logout when a token exists
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

                    {/* Pass currentUserId to Home component */}
                    <Route
                        path="/"
                        element={token ? <Home token={token} currentUserId={currentUserId} /> : <Navigate to="/login" replace />}
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;
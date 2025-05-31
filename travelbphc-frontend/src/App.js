// travelbphc-frontend/src/App.js
import React, { useState, useEffect } from 'react';
// Import necessary components from react-router-dom v6/7
import { BrowserRouter as Router, Route, Routes, useNavigate, Link, Navigate } from 'react-router-dom';
import './App.css'; // Your main CSS file

// Import your custom components
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
    // State to hold the authentication token.
    // It's initialized by checking if a token already exists in localStorage.
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    // useNavigate hook for programmatic navigation in React Router v6/7
    const navigate = useNavigate();

    // useEffect hook to manage authentication-based redirection
    // This runs on component mount and whenever 'token' or 'navigate' changes.
    useEffect(() => {
        if (token) {
            // If a token exists (user is logged in), and they are on the login or signup page,
            // redirect them to the home page to prevent them from accessing auth forms while logged in.
            if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
                navigate('/');
            }
        } else {
            // If no token exists (user is not logged in), and they are trying to access
            // any page other than login or signup, redirect them to the login page.
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                navigate('/login');
            }
        }
    }, [token, navigate]); // Dependencies: re-run effect if token or navigate function changes

    // Handler for successful user login
    const handleLoginSuccess = (jwtToken) => {
        localStorage.setItem('token', jwtToken); // Store the received JWT in browser's local storage
        setToken(jwtToken); // Update the component's state with the new token
        alert('Logged in successfully!'); // Provide user feedback
        navigate('/'); // Redirect the user to the home page after successful login
    };

    // Handler for successful user signup
    const handleSignupSuccess = () => {
        alert('Account created successfully! Please log in.'); // Inform user of successful registration
        navigate('/login'); // Redirect the user to the login page so they can log in
    };

    // Handler for user logout
    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the JWT from local storage
        setToken(null); // Clear the token from component state
        alert('Logged out successfully!'); // Provide user feedback
        navigate('/login'); // Redirect the user to the login page after logging out
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>TravelBPHC</h1> {/* Main application title */}
                <nav>
                    {/* Conditional rendering for navigation links: */}
                    {token ? ( // If 'token' exists (user is authenticated)
                        <ul> {/* Render an unordered list for navigation */}
                            <li><Link to="/">Home</Link></li> {/* Link to the home page */}
                            {/* Add more authenticated links here as your app grows (e.g., "My Profile", "Create New Post") */}
                            <li><button onClick={handleLogout} className="link-button">Logout</button></li> {/* Logout button */}
                        </ul>
                    ) : (
                        // If no 'token' (user is not authenticated), render nothing in the header navigation.
                        // The login/signup forms will be displayed via the <Routes> below.
                        null
                    )}
                </nav>
            </header>

            <main>
                {/* React Router v6/7 <Routes> component defines the routing configuration */}
                <Routes>
                    {/* Public Routes: Accessible to everyone, regardless of authentication status */}
                    <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/signup" element={<Signup onSignupSuccess={handleSignupSuccess} />} />

                    {/* Protected Route: The Home component (where posts are managed) */}
                    {/* This route uses conditional rendering:
                        - If 'token' exists, render the Home component, passing the token as a prop.
                        - If no 'token', redirect the user to the /login page using <Navigate replace />.
                    */}
                    <Route
                        path="/"
                        element={token ? <Home token={token} /> : <Navigate to="/login" replace />}
                    />
                    {/* You can add more protected routes here following the same pattern */}
                    {/* Example: <Route path="/profile" element={token ? <Profile token={token} /> : <Navigate to="/login" replace />} /> */}
                </Routes>
            </main>
        </div>
    );
}

export default App; // Export the main App component

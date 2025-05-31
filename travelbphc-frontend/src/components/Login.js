import React, { useState } from 'react';
// --- IMPORTANT: Use useHistory for React Router DOM v5 ---
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';

// Define your backend API URL for authentication
const API_URL_AUTH = 'http://localhost:5000/api/auth';

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- IMPORTANT: Use useHistory hook for v5 ---
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Make the API call to your backend login endpoint
            const response = await axios.post(`${API_URL_AUTH}/login`, {
                email,
                password
            });

            // If login is successful, call the success handler from App.js
            onLoginSuccess(response.data.token); // Pass the token to App.js handler
            console.log('Login successful:', response.data.message);

        } catch (err) {
            setLoading(false);
            if (err.response) {
                setError(err.response.data.message || 'Login failed. Please check credentials.');
                console.error('Login error (response):', err.response.data);
            } else if (err.request) {
                setError('No response from server. Is the backend running?');
                console.error('Login error (request):', err.request);
            } else {
                setError('Error during login. Please try again.');
                console.error('Login error (message):', err.message);
            }
        } finally {
            // setLoading(false); // Only set false on error, success handler redirects
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging In...' : 'Login'}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
    );
}

export default Login;
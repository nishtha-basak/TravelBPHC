import React, { useState } from 'react';
// --- IMPORTANT: Use useHistory for React Router DOM v5 ---
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';

// Define your backend API URL for authentication
const API_URL_AUTH = 'http://localhost:5000/api/auth';

function Signup({ onSignupSuccess }) {
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
            // Make the API call to your backend registration endpoint
            const response = await axios.post(`${API_URL_AUTH}/register`, {
                email,
                password
            });

            // If registration is successful, call the success handler from App.js
            onSignupSuccess(); // This will navigate to login and show an alert
            console.log('Signup successful:', response.data.message);

        } catch (err) {
            setLoading(false);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(err.response.data.message || 'Signup failed. Please try again.');
                console.error('Signup error (response):', err.response.data);
            } else if (err.request) {
                // The request was made but no response was received
                setError('No response from server. Is the backend running?');
                console.error('Signup error (request):', err.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('Error during signup. Please try again.');
                console.error('Signup error (message):', err.message);
            }
        } finally {
            // setLoading(false); // Only set false on error, success handler redirects
        }
    };

    return (
        <div className="auth-container">
            <h2>Sign Up</h2>
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
                        minLength="6"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
}

export default Signup;
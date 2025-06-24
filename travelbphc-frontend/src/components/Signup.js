import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Use useNavigate for v6/7
import axios from 'axios';

const API_URL_AUTH = `${process.env.REACT_APP_API_BASE_URL}/api/auth`;

function Signup({ onSignupSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate(); // Use useNavigate hook for v6/7

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL_AUTH}/register`, {
                email,
                password
            });
            
            onSignupSuccess();
            console.log('Signup successful:', response.data.message);

        } catch (err) {
            setLoading(false);
            if (err.response) {
                setError(err.response.data.message || 'Signup failed. Please try again.');
                console.error('Signup error (response):', err.response.data);
            } else if (err.request) {
                setError('No response from server. Is the backend running?');
                console.error('Signup error (request):', err.request);
            } else {
                setError('Error during signup. Please try again.');
                console.error('Signup error (message):', err.message);
            }
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
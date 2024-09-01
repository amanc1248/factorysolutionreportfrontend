import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import '../styles/Login.css';
import { login } from '../actions/loginAction';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(''); // State for handling error messages
    const navigate = useNavigate(); // Initialize the useNavigate hook

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clear any previous error messages
        setError('');

        // Add your authentication logic here
        login(email, password)
            .then(response => {
                console.log(response);
                // Check for successful login
                if (response.status === 200) {  // Assuming a successful response has status code 200
                    // Store user data in local storage
                    localStorage.setItem('user', JSON.stringify(response.data)); // Assuming response.data contains user data
                    // Redirect to the homepage
                    navigate('/home');
                } else if (response.status === 401) { // Assuming 401 for unauthorized
                    setError('Invalid email or password.'); // Set error message
                } else {
                    setError('An unknown error occurred.'); // Fallback error message
                }
            })
            .catch(error => {
                console.error(error);
                setError('Failed to login. Please try again later.');
            });
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2 className="login-title">Login</h2>
                {error && <p className="error-message">{error}</p>} {/* Display error message if exists */}
                <div className="form-group">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                        type="email"
                        className="form-input"
                        id="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        className="form-input"
                        id="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="showPassword"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                    />
                    <label className="form-check-label" htmlFor="showPassword">
                        Show Password
                    </label>
                </div>
                <button type="submit" className="btn-submit">
                    Submit
                </button>
            </form>
        </div>
    );
}

export default Login;

import { useState } from 'react';
import { Link } from 'react-router-dom'; // ✅ for navigation
import { api } from '../lib/api';
import './Signup.css';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post('/auth/register', form);
      setMessage('Signup successful!');
    } catch (error) {
      setMessage(JSON.stringify(error.response?.data) || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Your Account</h2>

        <div className="form-group">
          <label>Username</label>
          <input
            name="username"
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Sign Up'}
        </button>

        {message && <p className="message">{message}</p>}

        {/* ✅ Already have account link */}
        <p className="switch-auth">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

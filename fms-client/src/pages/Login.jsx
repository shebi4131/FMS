import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use your imported api to make the login request
      const response = await api.post("/auth/login", form);

      const data = response.data || response;

      // Check if login was successful - your backend returns 200 with message
      if (response.status === 200 && data.message === "Login successful") {
        // Store token, roles, and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRoles", JSON.stringify(data.roles));
        localStorage.setItem("userEmail", form.email);
        localStorage.setItem("isLoggedIn", "true");
        
        // Redirect to records page on successful login
        navigate("/records");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err); // Debug log
      
      if (err.response) {
        // Server responded with error status (401, 400, etc.)
        const errorMessage = err.response.data?.message || 
                            err.response.data?.error || 
                            "Invalid email or password.";
        setError(errorMessage);
      } else if (err.request) {
        // Network error
        setError("Network error. Please check your connection.");
      } else {
        // Other error
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>File Management System</h2>

        {error && <div className="error-message">{error}</div>}

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
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="signup-link">
          New user? <Link to="/signup">Sign up</Link>
        </p>

        <p className="forgot-link">
          <Link to="/forgetpass">Forgot Password?</Link>
        </p>
      </form>
    </div>
  );
}
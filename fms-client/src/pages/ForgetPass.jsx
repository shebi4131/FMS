import { useState } from "react";
import "./ForgetPass.css";

export default function ForgetPass() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // API call to send reset password email will go here
    setTimeout(() => {
      setLoading(false);
      setMessage(
        "If this email is registered, you will receive your password shortly."
      );
      setEmail("");
    }, 1500);
  };

  return (
    <div className="forget-container">
      <form className="forget-card" onSubmit={handleSubmit}>
        <h2>Forgot Password?</h2>
        <p>Enter your email to receive your password via mail.</p>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Email"}
        </button>

        {message && <p className="success-msg">{message}</p>}
      </form>
    </div>
  );
}

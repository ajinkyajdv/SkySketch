import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./styles.css"; 

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/Home");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/Home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="forgot-password">Forgot password?</div>
          <button type="submit" className="login-btn">Login</button>
        </form>

        <p>
          Don't have an account? <span className="signup-link" onClick={() => navigate("/register")}>Signup</span>
        </p>

        <div className="divider">
          <hr />
          <span>Or</span>
          <hr />
        </div>

        <button onClick={handleGoogleLogin} className="google-btn">
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../Auth/Auth.css";
import logo from "../../photos/logo.svg";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("All fields are mandatory.");

    try {
      const response = await fetch("http://localhost:3000/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        login(data.token);
        navigate("/home");
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch {
      setError("Server connection error. Ensure the backend is running.");
    }
  };

  return (
    <div className="copa-auth-container">
      <div className="copa-auth-card">
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2">
            <img src={logo} alt="CopaDrive" className="copa-logo" />
            <span className="copa-brand-text">Copadrive</span>
          </div>
          <h1 className="h4 mt-3 mb-1">Sign in</h1>
          <div className="text-secondary">Use your Copa Account</div>
        </div>

        <form onSubmit={handleSubmit} className="d-grid gap-3">
          <div>
            <input
              type="email"
              className="form-control form-control-lg rounded-pill"
              placeholder="📧 Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <input
              type="password"
              className="form-control form-control-lg rounded-pill"
              placeholder="🔒 Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="alert alert-danger py-2 mb-0">{error}</div>}

          <div className="d-flex justify-content-between align-items-center mt-1">
            <Link to="/register" className="btn btn-outline-secondary rounded-pill px-3">
              Create account
            </Link>

            <button type="submit" className="btn btn-primary btn-lg rounded-pill px-4">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
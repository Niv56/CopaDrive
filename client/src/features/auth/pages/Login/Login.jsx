import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiLogIn, FiMusic } from "react-icons/fi"; // ✅ הוספתי FiMusic

import { useAuth } from "app/providers/AuthContext";
import "styles/pages/Auth.css";
import logo from "assets/photos/logo.svg";
import ThemeToggle from "features/drive/widgets/ThemeToggle";
import songFile from "assets/videos/Song.mp3"; // ✅ ייבוא שיר

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ פונקציית ניגון
  const playSong = () => {
    const audio = new Audio(songFile);
    audio.play().catch(e => console.log(e));
  };

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
    <div className="copa-auth-container" style={{ position: "relative" }}>
      
      {/* ✅ כאן השינוי: הוספת הכפתור ליד ThemeToggle */}
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10, display: "flex", alignItems: "center", gap: "10px" }}>
        
        {/* כפתור PlaySong מנצנץ */}
        <button className="btn-sparkle" style={{ padding: "6px 16px", fontSize: "14px", marginTop: "0" }} onClick={playSong}>
            <FiMusic style={{ marginRight: "6px" }} />
            <span className="sparkle-text">PlaySong</span>
            <div className="sparkle-stars">
              <div className="s-star s-1"></div>
              <div className="s-star s-2"></div>
            </div>
        </button>

        <ThemeToggle />
      </div>

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
          <div className="input-wrapper">
            <FiMail className="input-icon" />
            <input
              type="email"
              className="form-control form-control-lg rounded-pill"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              type="password"
              className="form-control form-control-lg rounded-pill"
              placeholder="Password"
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
              Sign in <FiLogIn />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
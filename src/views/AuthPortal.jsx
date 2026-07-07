import React, { useState } from "react";
import { loginUser, registerUser } from "../services/authService";
import styled from "styled-components";

const AVATARS = ["🤖", "⚽", "🏃‍♂️", "👮‍♂️", "🍿", "🎟️", "🏟️", "🍔"];

export default function AuthPortal({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Input fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("fan");
  const [avatar, setAvatar] = useState("⚽");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    const res = await loginUser(email, password);
    if (res.success) {
      setSuccess("Welcome back! Redirecting...");
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 800);
    } else {
      setError(res.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const res = await registerUser(name, email, password, role, avatar);
    if (res.success) {
      setSuccess("Account registered successfully! Redirecting...");
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 800);
    } else {
      setError(res.message);
    }
  };

  // Login as demo user helper
  const handleQuickLogin = async (demoEmail) => {
    const res = await loginUser(demoEmail, "password123");
    if (res.success) {
      setSuccess(`Logged in as ${res.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Dynamic blurred neon background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/20 blur-[120px] animate-pulse pointer-events-none" />

      {/* Main glass container */}
      <div className="w-full max-w-md bg-surface-container-high/65 backdrop-blur-xl border border-outline-variant/30 p-8 rounded-2xl shadow-2xl relative z-10">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-primary text-3xl font-extrabold" style={{ fontVariationSettings: "'FILL' 1" }}>sports_stadium</span>
            <span className="text-xl font-extrabold tracking-widest bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">STADIAMIQ</span>
          </div>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-[0.25em]">Cloud Authentication Service</p>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error text-xs font-mono p-3 rounded-lg mb-4 flex items-center gap-2 animate-shake">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-secondary-container/20 border border-secondary/30 text-secondary-light text-xs font-mono p-3 rounded-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
            <span>{success}</span>
          </div>
        )}

        {/* Flip-card Wrapper */}
        <StyledWrapper>
          <div className="wrapper">
            <input 
              type="checkbox" 
              className="toggle" 
              id="auth-toggle"
              checked={isRegisterMode}
              onChange={(e) => {
                setIsRegisterMode(e.target.checked);
                setError("");
                setSuccess("");
              }}
            />
            <div className="card-switch">
              <label className="switch" htmlFor="auth-toggle">
                <span className="slider" />
                <span className="card-side" />
              </label>
            </div>

            <div className="flip-card__inner">
              {/* Front Side: Login */}
              <div className="flip-card__front">
                <div className="title">Log in</div>
                <form className="flip-card__form" onSubmit={handleLogin}>
                  <input 
                    className="flip-card__input" 
                    name="email" 
                    placeholder="Email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input 
                    className="flip-card__input" 
                    name="password" 
                    placeholder="Password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="flip-card__btn">Let's go!</button>
                </form>
              </div>

              {/* Back Side: Signup */}
              <div className="flip-card__back">
                <div className="title">Sign up</div>
                <form className="flip-card__form" onSubmit={handleRegister}>
                  <input 
                    className="flip-card__input" 
                    placeholder="Name" 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input 
                    className="flip-card__input" 
                    name="email" 
                    placeholder="Email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input 
                    className="flip-card__input" 
                    name="password" 
                    placeholder="Password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  
                  {/* Role & Avatar dropdowns */}
                  <div className="flex gap-2 w-[250px] justify-between">
                    <select 
                      className="flip-card__select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="fan">Fan View</option>
                      <option value="staff">Field Staff</option>
                      <option value="organizer">Director</option>
                    </select>

                    <select 
                      className="flip-card__select"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                    >
                      {AVATARS.map((av) => (
                        <option key={av} value={av}>{av} Icon</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="flip-card__btn">Confirm!</button>
                </form>
              </div>
            </div>
          </div>
        </StyledWrapper>

        {/* Pre-seeded demo credentials quick panel */}
        <div className="mt-8 border-t border-outline-variant/20 pt-6">
          <div className="text-[9px] font-mono text-outline uppercase tracking-widest text-center mb-3">
            🔐 Pre-Configured Developer Accounts
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin("admin@stadiumiq.com")}
              className="bg-primary/10 border border-primary/20 hover:border-primary hover:bg-primary/20 text-primary-light font-mono text-[9px] font-bold py-1.5 px-1 rounded transition-all"
            >
              ADMIN
            </button>
            <button
              onClick={() => handleQuickLogin("staff@stadiumiq.com")}
              className="bg-secondary/10 border border-secondary/20 hover:border-secondary hover:bg-secondary/20 text-secondary font-mono text-[9px] font-bold py-1.5 px-1 rounded transition-all"
            >
              STAFF
            </button>
            <button
              onClick={() => handleQuickLogin("fan@stadiumiq.com")}
              className="bg-outline-variant/10 border border-outline-variant/20 hover:border-outline hover:bg-outline-variant/20 text-on-surface font-mono text-[9px] font-bold py-1.5 px-1 rounded transition-all"
            >
              GUEST FAN
            </button>
          </div>
        </div>

        {/* Service status info */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-on-surface-variant/40 bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/10">
            <span className="w-1 h-1 rounded-full bg-secondary" />
            Database engine local persistence (localStorage DB)
          </span>
        </div>

      </div>
    </div>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .wrapper {
    --input-focus: #b7c4ff;
    --font-color: #dae2fd;
    --font-color-sub: #8d90a2;
    --bg-color: #171f33;
    --bg-color-alt: #222a3d;
    --main-color: #b7c4ff;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
  }

  .card-switch {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
  }

  /* switch card */
  .switch {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 30px;
    width: 50px;
    height: 20px;
  }

  .card-side::before {
    position: absolute;
    content: 'Log in';
    left: -75px;
    top: 0;
    width: 100px;
    text-decoration: underline;
    color: var(--font-color);
    font-weight: 600;
    cursor: pointer;
  }

  .card-side::after {
    position: absolute;
    content: 'Sign up';
    left: 75px;
    top: 0;
    width: 100px;
    text-decoration: none;
    color: var(--font-color);
    font-weight: 600;
    cursor: pointer;
  }

  .toggle {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .slider {
    box-sizing: border-box;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-color);
    transition: 0.3s;
  }

  .slider:before {
    box-sizing: border-box;
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    border: 2px solid var(--main-color);
    border-radius: 5px;
    left: -2px;
    bottom: 2px;
    background-color: var(--bg-color);
    box-shadow: 0 3px 0 var(--main-color);
    transition: 0.3s;
  }

  .toggle:checked ~ .card-switch .slider {
    background-color: var(--input-focus);
  }

  .toggle:checked ~ .card-switch .slider:before {
    transform: translateX(30px);
  }

  .toggle:checked ~ .card-switch .card-side:before {
    text-decoration: none;
  }

  .toggle:checked ~ .card-switch .card-side:after {
    text-decoration: underline;
  }

  /* card */ 

  .flip-card__inner {
    width: 300px;
    height: 480px;
    position: relative;
    background-color: transparent;
    perspective: 1000px;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .toggle:checked ~ .flip-card__inner {
    transform: rotateY(180deg);
  }

  .flip-card__front, .flip-card__back {
    padding: 20px;
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    background: var(--bg-color-alt);
    gap: 15px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
  }

  .flip-card__back {
    transform: rotateY(180deg);
  }

  .flip-card__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .title {
    margin: 10px 0;
    font-size: 25px;
    font-weight: 900;
    text-align: center;
    color: var(--main-color);
  }

  .flip-card__input {
    width: 250px;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 14px;
    font-weight: 600;
    color: var(--font-color);
    padding: 5px 10px;
    outline: none;
  }

  .flip-card__input::placeholder {
    color: var(--font-color-sub);
    opacity: 0.8;
  }

  .flip-card__input:focus {
    border: 2px solid var(--input-focus);
  }

  .flip-card__select {
    width: 121px;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 13px;
    font-weight: 600;
    color: var(--font-color);
    padding: 5px 10px;
    outline: none;
    cursor: pointer;
  }

  .flip-card__select:focus {
    border: 2px solid var(--input-focus);
  }

  .flip-card__btn:active {
    box-shadow: 0px 0px var(--main-color);
    transform: translate(3px, 3px);
  }

  .flip-card__btn {
    margin: 15px 0 10px 0;
    width: 120px;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 17px;
    font-weight: 600;
    color: var(--font-color);
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
  }
`;

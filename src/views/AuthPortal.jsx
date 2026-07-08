import React, { useState } from "react";
import { loginUser, registerUser } from "../services/authService";
import styled from "styled-components";

const BLOCKED_EMAIL_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "yopmail.com", "tempmail.com", "10minutemail.com"
]);

const validateEmail = (email) => {
  const formatRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!formatRegex.test(email)) return "Please enter a valid email address.";

  const domain = email.toLowerCase().split("@")[1];
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return "Disposable email addresses are not allowed.";
  }
  return null;
};

export default function AuthPortal({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Input fields for signup
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAwaitingEmail, setIsAwaitingEmail] = useState(false);

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
      // For login, onLoginSuccess receives the raw user. App.jsx checks the session.
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

    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const res = await registerUser(username, email, password);
    if (res.success) {
      setSuccess(res.message); // "Check your email to confirm your account!"
      setIsAwaitingEmail(true);
      // Automatically switch to login mode after a delay
      setTimeout(() => {
        setIsRegisterMode(false);
        setPassword("");
        setConfirmPassword("");
      }, 3000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Dynamic blurred neon background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/20 blur-[120px] animate-pulse pointer-events-none" />

      {/* Main glass container */}
      <div className="w-full max-w-md bg-surface-container-high/65 backdrop-blur-xl border border-outline-variant/30 px-4 py-8 sm:p-8 rounded-2xl shadow-2xl relative z-10">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-primary text-3xl font-extrabold" style={{ fontVariationSettings: "'FILL' 1" }}>sports_stadium</span>
            <span className="text-xl font-extrabold tracking-widest bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">STADIAMIQ</span>
          </div>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-[0.25em]">Cloud Authentication</p>
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
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        {isAwaitingEmail && (
           <div className="bg-primary-container/20 border border-primary/30 text-primary-light text-xs font-mono p-3 rounded-lg mb-4 text-center">
             Please check your inbox (and spam folder) for a confirmation link. You must click the link before you can log in.
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
                setIsAwaitingEmail(false);
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
                    placeholder="Username" 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    placeholder="Password (min 6 chars)" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <input 
                    className="flip-card__input" 
                    name="confirmPassword" 
                    placeholder="Confirm Password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <button type="submit" className="flip-card__btn">Sign Up!</button>
                </form>
              </div>
            </div>
          </div>
        </StyledWrapper>
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

  .flip-card__inner {
    width: 290px;
    max-width: 100%;
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
    width: 240px;
    max-width: 100%;
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

  .flip-card__btn {
    margin: 15px 0 10px 0;
    width: 116px;
    max-width: 100%;
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

  .flip-card__btn:active {
    box-shadow: 0px 0px var(--main-color);
    transform: translate(3px, 3px);
  }
`;

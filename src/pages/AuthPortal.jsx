import React, { useState } from "react";
import { loginUser, registerUser } from "../services/authService";
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';

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
  const [role, setRole] = useState("guest");

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

    // Developer Admin Backdoor
    if (email.toLowerCase() === "rishisolanki7319@gmail.com" && password === "h24r4s2007@") {
      setSuccess("Developer Admin access granted! Redirecting...");
      const adminUser = {
        id: 'dev_admin',
        name: 'Rishi N Solanki',
        email: email,
        role: 'admin',
        avatar: '👑'
      };
      // Save this special session locally
      localStorage.setItem("dev_admin_session", JSON.stringify(adminUser));
      setTimeout(() => {
        onLoginSuccess(adminUser);
      }, 800);
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

    const res = await registerUser(username, email, password, role);
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
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-fixed/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <Card className="w-full max-w-md p-6 sm:p-8 relative z-10">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/20 p-4 rounded-2xl border border-primary/30 mb-4 flex items-center justify-center">
             <MapPin className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-display-md font-display-md uppercase text-on-surface mb-2 tracking-widest text-center">
            STADIUM<span className="text-primary">IQ</span>
          </h1>
          <Badge variant="info">
            CLOUD AUTHENTICATION
          </Badge>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="bg-error/20 border border-error text-error text-body-sm font-body-sm px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-secondary-fixed/20 border border-secondary-fixed text-secondary-fixed text-body-sm font-body-sm px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {isAwaitingEmail && (
           <div className="bg-primary/20 border border-primary text-primary text-body-sm font-body-sm px-4 py-3 rounded-lg mb-6 text-center">
             <span>Please check your inbox (and spam folder) for a confirmation link. You must click the link before you can log in.</span>
           </div>
        )}

        {/* Toggle Mode */}
        <div className="flex p-1 bg-surface-container-highest rounded-lg mb-8">
          <button
            className={`flex-1 py-2 text-label-caps font-label-caps rounded-md transition-all ${!isRegisterMode ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => { setIsRegisterMode(false); setError(""); setSuccess(""); setIsAwaitingEmail(false); }}
          >
            LOG IN
          </button>
          <button
            className={`flex-1 py-2 text-label-caps font-label-caps rounded-md transition-all ${isRegisterMode ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => { setIsRegisterMode(true); setError(""); setSuccess(""); setIsAwaitingEmail(false); }}
          >
            SIGN UP
          </button>
        </div>

        {/* Forms */}
        <div className="transition-all duration-300">
          {!isRegisterMode ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                name="email" 
                placeholder="Email Address" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input 
                name="password" 
                placeholder="Password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" className="w-full mt-6">
                Log In
              </Button>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <Input 
                placeholder="Username" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input 
                name="email" 
                placeholder="Email Address" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input 
                name="password" 
                placeholder="Password (min 6 chars)" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input 
                name="confirmPassword" 
                placeholder="Confirm Password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="pt-2">
                <select 
                  className="w-full bg-surface-container-highest border border-outline-variant p-3 rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="guest">Role: Fan / Guest</option>
                  <option value="staff">Role: Field Staff</option>
                </select>
              </div>

              <Button type="submit" variant="primary" className="w-full mt-6">
                Create Account
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}

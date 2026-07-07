// Hybrid authentication engine (Supabase Cloud + LocalStorage persistence fallback)
import { supabase, isSupabaseConfigured } from "./supabaseClient";

const USER_DB_KEY = "stadiamiq_user_db";
const SESSION_KEY = "stadiamiq_session";

// Pre-seeded accounts for Local Storage fallback database
const DEFAULT_USERS = [
  {
    name: "Alex Carter",
    email: "admin@stadiumiq.com",
    password: "password123",
    role: "organizer",
    avatar: "🤖"
  },
  {
    name: "Sarah Chen",
    email: "staff@stadiumiq.com",
    password: "password123",
    role: "staff",
    avatar: "🏃‍♀️"
  },
  {
    name: "Guest Fan",
    email: "fan@stadiumiq.com",
    password: "password123",
    role: "fan",
    avatar: "⚽"
  }
];

const initDb = () => {
  if (!localStorage.getItem(USER_DB_KEY)) {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(DEFAULT_USERS));
  }
};

// 1. Sign Up / Register
export const registerUser = async (name, email, password, role = "fan", avatar = "⚽") => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, avatar }
      }
    });

    if (error) return { success: false, message: error.message };
    if (!data.user) return { success: false, message: "Verification email sent. Please check your inbox." };
    
    const userObj = {
      name: data.user.user_metadata?.name || name,
      email: data.user.email,
      role: data.user.user_metadata?.role || role,
      avatar: data.user.user_metadata?.avatar || avatar
    };
    return { success: true, user: userObj };
  }

  // Fallback to LocalStorage DB
  initDb();
  const users = JSON.parse(localStorage.getItem(USER_DB_KEY));
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (exists) {
    return { success: false, message: "Email is already registered" };
  }

  const newUser = { name, email: email.toLowerCase(), password, role, avatar };
  users.push(newUser);
  localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  
  return { success: true, user: newUser };
};

// 2. Sign In / Login
export const loginUser = async (email, password) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return { success: false, message: error.message };

    const user = data.user;
    const userObj = {
      name: user.user_metadata?.name || email.split("@")[0],
      email: user.email,
      role: user.user_metadata?.role || "fan",
      avatar: user.user_metadata?.avatar || "⚽"
    };
    return { success: true, user: userObj };
  }

  // Fallback to LocalStorage DB
  initDb();
  const users = JSON.parse(localStorage.getItem(USER_DB_KEY));
  const matched = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!matched) {
    return { success: false, message: "Invalid email or password" };
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(matched));
  return { success: true, user: matched };
};

// 3. Sign Out / Logout
export const logoutUser = async () => {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(SESSION_KEY);
};

// 4. Resolve Active Session
export const getCurrentSession = async () => {
  if (isSupabaseConfigured) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const user = session.user;
    return {
      name: user.user_metadata?.name || user.email.split("@")[0],
      email: user.email,
      role: user.user_metadata?.role || "fan",
      avatar: user.user_metadata?.avatar || "⚽"
    };
  }

  // Fallback to LocalStorage DB
  initDb();
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

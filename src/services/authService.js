// Hybrid authentication engine (Supabase Cloud + LocalStorage persistence fallback)
import { supabase, isSupabaseConfigured } from "./supabaseClient";

const USER_DB_KEY = "stadiamiq_user_db";
const SESSION_KEY = "stadiamiq_session";

// Pre-seeded accounts for Local Storage fallback database
const DEFAULT_USERS = [
  {
    name: "rishi n solanki",
    email: "rishisolanki7319@gmail.com",
    password: "h24r4s2007@",
    role: "admin",
    avatar: "👑"
  },
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
  const existing = localStorage.getItem(USER_DB_KEY);
  if (!existing) {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(DEFAULT_USERS));
  } else {
    try {
      const users = JSON.parse(existing);
      if (!users.some(u => u.email.toLowerCase() === "rishisolanki7319@gmail.com")) {
        const adminUser = DEFAULT_USERS.find(u => u.email === "rishisolanki7319@gmail.com");
        if (adminUser) {
          users.push(adminUser);
          localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
        }
      }
    } catch (e) {
      localStorage.setItem(USER_DB_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }
};

export const registerUser = async (name, email, password, role = "fan", avatar = "⚽") => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          avatar
        }
      }
    });

    if (error) {
      console.error("[Supabase Auth Error] Full error object:", error);
      
      let msg = error.message;
      if (error.status === 429) {
        msg = "Rate limit exceeded: You can only request 3 emails per hour on the Supabase Free Tier. Please disable 'Confirm email' in your Supabase Auth settings to continue testing.";
      } else if (!msg || typeof msg === "object" || msg === "{}" || msg === "[object Object]") {
        msg = `Unknown Error (Status: ${error.status || 'N/A'}). Check your browser console for details, or ensure 'Enable Email signup' is ON in Supabase.`;
      }
      return { success: false, message: msg };
    }

    // Supabase returns an empty identities array if the user already exists (to prevent enumeration)
    if (data?.user?.identities && data.user.identities.length === 0) {
      return { success: false, message: "This email is already registered. Please log in instead." };
    }
    
    // Supabase will automatically send the confirmation email here if enabled in dashboard
    return { 
      success: true, 
      user: data.user, 
      message: "Check your email to confirm your account!" 
    };
  }

  // Fallback to LocalStorage DB if no Supabase
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
export const loginUser = async (username, email, password) => {
  // Bypass Supabase for any pre-configured demo users in the local DB
  initDb();
  const users = JSON.parse(localStorage.getItem(USER_DB_KEY));
  const localMatch = users.find(
    u => u.name.toLowerCase() === username.toLowerCase() && u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (localMatch) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(localMatch));
    return { success: true, user: localMatch };
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return { success: false, message: error.message };

    const user = data.user;
    
    // Supabase does not native check usernames during signInWithPassword (it checks email/pass).
    // If the entered username doesn't match the metadata name, we can reject it.
    const metaName = user.user_metadata?.name || email.split("@")[0];
    if (metaName.toLowerCase() !== username.toLowerCase()) {
      // For security, you might want to log them out or just return false
      await supabase.auth.signOut();
      return { success: false, message: "Invalid username for this account" };
    }

    const userObj = {
      name: metaName,
      email: user.email,
      role: user.user_metadata?.role || "fan",
      avatar: user.user_metadata?.avatar || "⚽"
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
    return { success: true, user: userObj };
  }

  return { success: false, message: "Invalid username, email or password" };
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
    if (session) {
      const user = session.user;
      return {
        name: user.user_metadata?.name || user.email.split("@")[0],
        email: user.email,
        role: user.user_metadata?.role || "fan",
        avatar: user.user_metadata?.avatar || "⚽"
      };
    }
  }

  // Fallback to LocalStorage DB
  initDb();
  const storedSession = localStorage.getItem(SESSION_KEY);
  return storedSession ? JSON.parse(storedSession) : null;
};

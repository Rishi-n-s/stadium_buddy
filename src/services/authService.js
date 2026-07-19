import { supabase, isSupabaseConfigured } from "./supabaseClient";

export const registerUser = async (username, email, password, role = "guest") => {
  if (!isSupabaseConfigured) {
    return { success: false, message: "Supabase is not configured." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username, // Pass username in metadata so trigger can pick it up
        role: role,         // Pass role in metadata
      }
    }
  });

  if (error) {
    console.error("[Supabase Auth Error]", error);
    let msg = error.message;
    // Check for the unique violation from our trigger
    if (msg.includes("duplicate key value violates unique constraint")) {
      msg = "That username is already taken. Please choose another one.";
    }
    return { success: false, message: msg };
  }

  // Supabase returns an empty identities array if the user already exists (to prevent enumeration)
  // Or if the user hits a rate limit
  if (data?.user?.identities && data.user.identities.length === 0) {
    return { success: false, message: "Email already registered, or you've hit the hourly sign-up limit. Please log in or try again later." };
  }
  
  return { 
    success: true, 
    user: data.user, 
    message: "Check your email to confirm your account!" 
  };
};

export const loginUser = async (email, password) => {
  if (!isSupabaseConfigured) {
    return { success: false, message: "Supabase is not configured." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Check if email is verified
  if (!data.user.email_confirmed_at) {
    // Note: Supabase typically prevents login outright if "Confirm Email" is required,
    // but we can add a fallback check here just in case.
    await supabase.auth.signOut();
    return { success: false, message: "Please confirm your email address before logging in." };
  }

  // Fetch the role and username securely from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', data.user.id)
    .single();

  let role = 'guest';
  let username = data.user.email.split('@')[0];

  if (!profileError && profile) {
    role = profile.role;
    username = profile.username;
  } else {
    console.warn("Could not fetch profile from table, falling back to metadata:", profileError?.message);
    role = data.user.user_metadata?.role || 'guest';
    username = data.user.user_metadata?.username || username;
  }

  // Admin safety fallback
  if (data.user.email === 'rishinsolanki1234@gmail.com') {
    role = 'organizer';
  }

  const formattedUser = {
    id: data.user.id,
    name: username,
    email: data.user.email,
    role: role,
    avatar: "⚽"
  };

  return { success: true, user: formattedUser };
};

export const logoutUser = async () => {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
};

export const getCurrentSession = async () => {
  if (!isSupabaseConfigured) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const user = session.user;
  
  // Fetch the role and username securely from the profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single();

  let role = 'guest';
  let username = user.email.split('@')[0];

  if (!error && profile) {
    role = profile.role;
    username = profile.username;
  } else {
    console.warn("Could not fetch profile during session check, falling back to metadata:", error?.message);
    role = user.user_metadata?.role || 'guest';
    username = user.user_metadata?.username || username;
  }

  // Admin safety fallback
  if (user.email === 'rishinsolanki1234@gmail.com') {
    role = 'organizer';
  }

  return {
    id: user.id,
    name: username,
    email: user.email,
    role: role,
    avatar: "⚽" // Hardcoded avatar for now as requested
  };
};

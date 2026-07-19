const API_URL = "http://localhost:5000/api/auth";

export const registerUser = async (username, email, password, role = "guest") => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Registration failed." };
    }

    // Save token for auto-login
    if (data.token) {
      localStorage.setItem("stadiumiq_token", data.token);
    }

    return { 
      success: true, 
      user: data.user, 
      message: "Registration successful!" 
    };
  } catch (error) {
    console.error("Auth Error:", error);
    return { success: false, message: "Network error. Is the auth server running?" };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Login failed." };
    }

    if (data.token) {
      localStorage.setItem("stadiumiq_token", data.token);
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Auth Error:", error);
    return { success: false, message: "Network error. Is the auth server running?" };
  }
};

export const logoutUser = async () => {
  localStorage.removeItem("stadiumiq_token");
};

export const getCurrentSession = async () => {
  const token = localStorage.getItem("stadiumiq_token");
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Token invalid or expired
      localStorage.removeItem("stadiumiq_token");
      return null;
    }

    const data = await response.json();
    return {
      id: data.user.id,
      name: data.user.username,
      email: data.user.email,
      role: data.user.role,
      avatar: "⚽"
    };
  } catch (error) {
    console.error("Session Error:", error);
    return null;
  }
};

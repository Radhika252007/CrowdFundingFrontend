async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
        const res = await fetch("https://crowdfundingbackend-1.onrender.com/api/auth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: refreshToken })
        });

        let data;
        try {
            data = await res.json();
        } catch {
            data = { message: "Unknown error" };
        }

        if (res.ok) {
            localStorage.setItem("accessToken", data.accessToken);
            return data.accessToken;
        } else {
            console.error("Token refresh failed:", data.message); 
            
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/components/Login-SignIn.html";
        }
    } catch (err) {
        console.error("Error refreshing token:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/components/Login-SignIn.html";
    }
}

function startTokenRefresh() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expiresIn = payload.exp * 1000 - Date.now();
        const refreshTime = Math.max(expiresIn - 60000, 0);

        setTimeout(async () => {
            await refreshAccessToken();
            startTokenRefresh();
        }, refreshTime);
    } catch (err) {
        console.error("Invalid access token:", err);
        localStorage.removeItem("accessToken");
        window.location.href = "/components/Login-SignIn.html";
    }
}

// ------------------ Page Load ------------------
document.addEventListener("DOMContentLoaded", () => {
    startTokenRefresh();
    showUserLogo();
});

// ------------------ Login Dropdown ------------------
const login_btn = document.getElementById('login-btn');
const content = document.getElementById('content');

login_btn.addEventListener("click", () => {
  content.style.display = content.style.display === 'block' ? 'none' : 'block';
});

window.addEventListener('click', (e) => {
  if (!login_btn.contains(e.target) && !content.contains(e.target)) {
    content.style.display = 'none';
  }
});

// ------------------ Redirect to Login/Signup ------------------
function showLoginPage(region) {
  if (region !== 'login' && region !== 'signup') return;
  localStorage.setItem('active', region);
  window.location.href = '/components/Login-SignIn.html';
}

// ------------------ User Logo & Profile ------------------
async function showUserLogo() {
  const token = localStorage.getItem('accessToken');
  const loginButtons = document.getElementById('login-buttons');
  const userSection = document.getElementById('user-section');
  const loginSmallLinks = document.querySelector('.login-s');
  const userDropdown = document.getElementById('user-dropdown'); // NEW container

  if (!token) {
    // Not logged in
    loginButtons.style.display = 'flex';
    userSection.style.display = 'none';
    loginSmallLinks.style.display = 'block';
    if (userDropdown) userDropdown.style.display = 'none';
    return;
  }

  try {
    const res = await fetch('https://crowdfundingbackend-1.onrender.com/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch profile');

    const user = await res.json();

    // Show user section
    loginButtons.style.display = 'none';
    userSection.style.display = 'flex';
    loginSmallLinks.style.display = 'none';
    if (userDropdown) userDropdown.style.display = 'none'; // start hidden

    // Set user logo
    const userLogo = document.getElementById('user-logo');
    userLogo.src = user.user_image || '/assets/default-user.png';
    userLogo.alt = user.name;

    // Mobile user dropdown toggle
    if (userDropdown) {
      userDropdown.innerHTML = `
        <a href="/components/UserProfile.html">Profile</a>
        <a href="#" id="logout-link">Logout</a>
      `;
      const logoutLink = document.getElementById('logout-link');
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
      });

      userLogo.addEventListener('click', () => {
        userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
      });
    }

  } catch (err) {
    console.error('Error fetching user profile:', err);
  }
}

// ------------------ Logout ------------------
async function handleLogout() {
  const token = localStorage.getItem('accessToken'); 
  if (!token) {
    alert('You are already logged out.');
    return;
  }

  try {
    const res = await fetch('https://crowdfundingbackend-1.onrender.com/api/auth/logout', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      alert(data.message || 'Logout successful');
      window.location.href = '../index.html';
    } else {
      alert(data.message || 'Logout failed');
    }
  } catch (err) {
    console.error('Logout error:', err);
    alert('Something went wrong during logout');
  }
}

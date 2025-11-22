export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
        const res = await fetch("https://crowdfundingbackend-1.onrender.com/api/auth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: refreshToken })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("accessToken", data.accessToken);
            return data.accessToken;
        } else {
            window.location.href = "/Frontend/components/Login-SignIn.html";
        }
    } catch (err) {
        console.error("Error refreshing token:", err);
    }
}

export function startTokenRefresh() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresIn = payload.exp * 1000 - Date.now();
    const refreshTime = Math.max(expiresIn - 60000, 0);

    setTimeout(async () => {
        await refreshAccessToken();
        startTokenRefresh(); 
    }, refreshTime);
}
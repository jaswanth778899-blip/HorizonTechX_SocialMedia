const API_URL = "http://localhost:5000/api/auth";


// ==========================================
// REGISTER USER
// ==========================================

async function registerUser() {

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) {
        alert("Please fill all fields.");
        return;
    }

    try {

        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {

            alert("Registration successful!");

            window.location.href = "login.html";

        } else {

            alert(data.message || "Registration failed.");

        }

    } catch (error) {

        console.error("Registration error:", error);

        alert("Unable to connect to server.");

    }
}


// ==========================================
// LOGIN USER
// ==========================================

async function loginUser() {

    // IMPORTANT:
    // Login uses EMAIL, not username

    const emailElement = document.getElementById("email");
    const passwordElement = document.getElementById("password");

    if (!emailElement || !passwordElement) {
        alert("Login form fields not found.");
        return;
    }

    const email = emailElement.value.trim();
    const password = passwordElement.value.trim();

    // Check empty fields
    if (!email || !password) {

        alert("Please enter email and password.");

        return;
    }

    try {

        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        console.log("Login response:", data);

        if (response.ok) {

            // Save login token
            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            // Save username
            if (data.user && data.user.username) {
                localStorage.setItem("username", data.user.username);
            }

            alert("Login successful!");

            window.location.href = "index.html";

        } else {

            alert(data.message || "Login failed.");

        }

    } catch (error) {

        console.error("Login error:", error);

        alert("Unable to connect to server.");

    }
}
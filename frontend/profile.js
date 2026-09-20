const API_URL = "http://localhost:5000/api/auth";

const username = localStorage.getItem("username");
const token = localStorage.getItem("token");

async function loadProfile() {
    try {
        const response = await fetch(API_URL + "/users");
        const users = await response.json();

        let currentUser = null;

        for (let user of users) {
            if (user.username === username) {
                currentUser = user;
                break;
            }
        }

        if (!currentUser) {
            document.getElementById("profileUsername").textContent =
                "User not found";
            return;
        }

        document.getElementById("profileUsername").textContent =
            "@" + currentUser.username;

        document.getElementById("profileEmail").textContent =
            "Horizon Social User";

        document.getElementById("followersCount").textContent =
            currentUser.followers ? currentUser.followers.length : 0;

        document.getElementById("followingCount").textContent =
            currentUser.following ? currentUser.following.length : 0;

        const container = document.getElementById("usersContainer");

        container.innerHTML = "";

        for (let user of users) {

            if (user.username === username) {
                continue;
            }

            let isFollowing = false;

            if (currentUser.following) {
                for (let id of currentUser.following) {
                    if (id.toString() === user._id.toString()) {
                        isFollowing = true;
                        break;
                    }
                }
            }

            const card = document.createElement("div");

            card.className = "post";

            card.innerHTML =
                "<div class='post-user'>@" + user.username + "</div>" +
                "<p>Followers: " +
                (user.followers ? user.followers.length : 0) +
                "</p><br>" +
                "<button onclick=\"followUser('" + user._id + "')\">" +
                (isFollowing ? "Following" : "Follow") +
                "</button>";

            container.appendChild(card);
        }

    } catch (error) {

        console.log(error);

        document.getElementById("profileUsername").textContent =
            "Unable to load profile";

        document.getElementById("usersContainer").innerHTML =
            "<p>Unable to load users.</p>";
    }
}


async function followUser(userId) {

    try {

        const response = await fetch(
            API_URL + "/follow/" + userId, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        alert(data.message);

        if (response.ok) {
            loadProfile();
        }

    } catch (error) {

        alert("Unable to connect to server.");

    }
}


function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    window.location.href = "login.html";
}


loadProfile();
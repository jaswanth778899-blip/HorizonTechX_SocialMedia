const API_URL = "http://localhost:5000/api";

const username = localStorage.getItem("username");

async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`);
        const posts = await response.json();

        const postsContainer = document.getElementById("postsContainer");
        postsContainer.innerHTML = "";

        if (posts.length === 0) {
            postsContainer.innerHTML = "<p>No posts yet.</p>";
            return;
        }

        posts.forEach(post => {
            const postUsername = post.user ?
                post.user.username :
                "Unknown User";

            const likeCount = post.likes ?
                post.likes.length :
                0;

            const postElement = document.createElement("div");
            postElement.className = "post";

            postElement.innerHTML = `
                <div class="post-user">
                    @${postUsername}
                </div>

                <div class="post-content">
                    ${post.content}
                </div>

                <div class="post-actions">

                    <button onclick="likePost('${post._id}')">
                        ❤️ Like (${likeCount})
                    </button>

                    <button onclick="commentOnPost('${post._id}')">
                        💬 Comment
                    </button>

                </div>

                <div id="comments-${post._id}" class="comments">
                    Loading comments...
                </div>
            `;

            postsContainer.appendChild(postElement);

            loadComments(post._id);
        });

    } catch (error) {
        console.error("Error loading posts:", error);

        document.getElementById("postsContainer").innerHTML =
            "<p>Unable to load posts.</p>";
    }
}


async function createPost() {

    if (!username) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const contentInput = document.getElementById("postContent");
    const content = contentInput.value.trim();

    if (!content) {
        alert("Please write something first.");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/posts/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    content: content
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert("Post created successfully!");

            contentInput.value = "";

            loadPosts();

        } else {

            alert(data.message || "Failed to create post.");

        }

    } catch (error) {

        console.error("Error creating post:", error);

        alert("Unable to connect to server.");

    }
}


async function likePost(postId) {

    if (!username) {
        alert("Please login first.");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/posts/${postId}/like`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            loadPosts();
        } else {
            alert(data.message || "Unable to like post.");
        }

    } catch (error) {

        console.error("Error liking post:", error);

        alert("Unable to connect to server.");

    }
}


function commentOnPost(postId) {

    const text = prompt("Write your comment:");

    if (!text) {
        return;
    }

    addComment(postId, text);
}


async function addComment(postId, text) {

    if (!username) {
        alert("Please login first.");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/posts/${postId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    text: text
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert("Comment added successfully!");

            loadComments(postId);

        } else {

            alert(data.message || "Failed to add comment.");

        }

    } catch (error) {

        console.error("Error adding comment:", error);

        alert("Unable to connect to server.");

    }
}


async function loadComments(postId) {

    try {

        const response = await fetch(
            `${API_URL}/posts/${postId}/comments`
        );

        const comments = await response.json();

        const container =
            document.getElementById(`comments-${postId}`);

        if (!container) {
            return;
        }

        if (comments.length === 0) {
            container.innerHTML =
                "<p>No comments yet.</p>";
            return;
        }

        container.innerHTML = "<strong>Comments:</strong>";

        comments.forEach(comment => {

            const commentUser = comment.user ?
                comment.user.username :
                "Unknown User";

            const commentElement =
                document.createElement("p");

            commentElement.innerHTML =
                `<strong>@${commentUser}</strong>: ${comment.text}`;

            container.appendChild(commentElement);
        });

    } catch (error) {

        console.error("Error loading comments:", error);

    }
}


function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    window.location.href = "login.html";
}


loadPosts();
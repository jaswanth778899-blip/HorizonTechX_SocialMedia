const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");

// =====================================================
// CREATE A POST
// =====================================================

router.post("/create", async(req, res) => {
    try {
        const { username, content } = req.body;

        if (!username || !content) {
            return res.status(400).json({
                message: "Username and content are required"
            });
        }

        // Find user
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Create post
        const post = new Post({
            user: user._id,
            content: content
        });

        await post.save();

        // Return post with user information
        const createdPost = await Post.findById(post._id)
            .populate("user", "username email");

        res.status(201).json({
            message: "Post created successfully",
            post: createdPost
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create post",
            error: error.message
        });
    }
});


// =====================================================
// GET ALL POSTS
// =====================================================

router.get("/", async(req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        res.json(posts);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch posts",
            error: error.message
        });
    }
});


// =====================================================
// LIKE / UNLIKE A POST
// =====================================================

router.put("/:id/like", async(req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                message: "Username is required"
            });
        }

        // Find user
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Find post
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Check if user already liked
        const alreadyLiked = post.likes.includes(user._id);

        if (alreadyLiked) {
            // Unlike
            post.likes = post.likes.filter(
                (userId) => userId.toString() !== user._id.toString()
            );
        } else {
            // Like
            post.likes.push(user._id);
        }

        await post.save();

        res.json({
            message: alreadyLiked ?
                "Post unliked successfully" : "Post liked successfully",
            likes: post.likes
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to like post",
            error: error.message
        });
    }
});


// =====================================================
// ADD COMMENT TO A POST
// =====================================================

router.post("/:id/comment", async(req, res) => {
    try {
        const { username, text } = req.body;

        if (!username || !text) {
            return res.status(400).json({
                message: "Username and comment text are required"
            });
        }

        // Find user
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Find post
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Create comment
        const comment = new Comment({
            post: post._id,
            user: user._id,
            text: text
        });

        await comment.save();

        // Return comment with user information
        const createdComment = await Comment.findById(comment._id)
            .populate("user", "username email");

        res.status(201).json({
            message: "Comment added successfully",
            comment: createdComment
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to add comment",
            error: error.message
        });
    }
});


// =====================================================
// GET COMMENTS FOR A POST
// =====================================================

router.get("/:id/comments", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comments = await Comment.find({
                post: req.params.id
            })
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        res.json(comments);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch comments",
            error: error.message
        });
    }
});


// =====================================================
// DELETE A POST
// =====================================================

router.delete("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        // Delete comments belonging to this post
        await Comment.deleteMany({
            post: req.params.id
        });

        // Delete post
        await Post.findByIdAndDelete(req.params.id);

        res.json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete post",
            error: error.message
        });
    }
});


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
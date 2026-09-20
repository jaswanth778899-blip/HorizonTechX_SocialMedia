const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// REGISTER
router.post("/register", async(req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

// LOGIN
router.post("/login", async(req, res) => {
    try {
        const { email, username, password } = req.body;

        if ((!email && !username) || !password) {
            return res.status(400).json({
                message: "Username/email and password are required"
            });
        }

        const user = await User.findOne(
            email ? { email } : { username }
        );

        if (!user) {
            return res.status(400).json({
                message: "Invalid username/email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid username/email or password"
            });
        }

        const token = jwt.sign({
                userId: user._id,
                username: user.username
            },
            process.env.JWT_SECRET || "horizon-secret-key", {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});

// GET ALL USERS
router.get("/users", async(req, res) => {
    try {
        const users = await User.find().select("-password -email");

        res.json(users);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get users",
            error: error.message
        });
    }
});

// FOLLOW USER
router.post("/follow/:userId", authMiddleware, async(req, res) => {
    try {
        const currentUser = await User.findById(req.userId);
        const targetUser = await User.findById(req.params.userId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (currentUser._id.toString() === targetUser._id.toString()) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            });
        }

        if (!currentUser.following) {
            currentUser.following = [];
        }

        if (!targetUser.followers) {
            targetUser.followers = [];
        }

        const alreadyFollowing = currentUser.following.some(
            id => id.toString() === targetUser._id.toString()
        );

        if (alreadyFollowing) {
            return res.status(400).json({
                message: "Already following this user"
            });
        }

        currentUser.following.push(targetUser._id);
        targetUser.followers.push(currentUser._id);

        await currentUser.save();
        await targetUser.save();

        res.json({
            message: "User followed successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Follow failed",
            error: error.message
        });
    }
});

// UNFOLLOW USER
router.post("/unfollow/:userId", authMiddleware, async(req, res) => {
    try {
        const currentUser = await User.findById(req.userId);
        const targetUser = await User.findById(req.params.userId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!currentUser.following) {
            currentUser.following = [];
        }

        if (!targetUser.followers) {
            targetUser.followers = [];
        }

        currentUser.following = currentUser.following.filter(
            id => id.toString() !== targetUser._id.toString()
        );

        targetUser.followers = targetUser.followers.filter(
            id => id.toString() !== currentUser._id.toString()
        );

        await currentUser.save();
        await targetUser.save();

        res.json({
            message: "User unfollowed successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Unfollow failed",
            error: error.message
        });
    }
});

module.exports = router;
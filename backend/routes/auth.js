const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            department
        });

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, role: user.role });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Optional: Check if role matches if provided
        if (role && user.role !== role) {
            return res.status(400).json({ msg: 'Role mismatch. Please select the correct role.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, role: user.role });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Store reset tokens temporarily (in-memory for demo, preferably DB in prod)
const resetTokens = {};

// Forgot Password (Token Based)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Generate token
        const token = crypto.randomBytes(20).toString('hex');
        resetTokens[token] = { email, expires: Date.now() + 3600000 }; // 1 hour

        // In a real app, send this token via email.
        // For this demo, we return it to the client for display/testing.
        res.json({ msg: 'Reset link sent (simulated)', token, resetLink: `http://localhost:5173/reset-password/${token}` });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const tokenData = resetTokens[token];
        if (!tokenData || tokenData.expires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired token' });
        }

        const user = await User.findOne({ email: tokenData.email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        delete resetTokens[token];

        res.json({ msg: 'Password reset successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update User Profile
router.put('/update', require('../middleware/auth'), async (req, res) => {
    try {
        const { name, department } = req.body;

        // Build profile object
        const profileFields = {};
        if (name) profileFields.name = name;
        if (department) profileFields.department = department;

        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update
        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Current User Profile
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

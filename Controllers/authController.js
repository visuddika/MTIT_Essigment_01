const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * @param {Object} user
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

/**
 * @desc User Registration
 * @route POST /api/auth/signup
 */
exports.signup = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already in use' });

        const user = new User({ username, email, password, role });
        await user.save();

        const token = generateToken(user);
        res.status(201).json({ token });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc User Login
 * @route POST /api/auth/signin
 */
exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(user);
        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
};

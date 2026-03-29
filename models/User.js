const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User Schema
 * @typedef {Object} User
 * @property {string} username - Unique username
 * @property {string} email - Unique email
 * @property {string} password - Hashed password
 * @property {string} role - User role ('user' or 'admin')
 */
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

/**
 * Pre-save middleware to hash passwords
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * Compare provided password with hashed password
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

const jwt = require('jsonwebtoken');

// Protect middleware - verifies JWT and attaches user
const protect = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
    const token = header.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized to access this route', error: err.message });
  }
};

// Authorize middleware - checks role
const authorize = (requiredRole) => (req, res, next) => {
  if (req.user && req.user.role === requiredRole) return next();
  return res.status(403).json({ message: `Not authorized to access this route. Required role: ${requiredRole}` });
};

module.exports = { protect, authorize };
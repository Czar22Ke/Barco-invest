import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access token required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'barco_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }
  next();
}

export function requireModerator(req, res, next) {
  const role = req.user && req.user.role ? req.user.role.toUpperCase() : '';
  if (role !== 'MODERATOR' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Moderator access required.' });
  }
  next();
}

export default authenticateToken;

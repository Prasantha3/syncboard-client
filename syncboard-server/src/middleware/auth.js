import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 'NO_TOKEN',
      message: 'No authorization token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecretkey123'
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      code: 'INVALID_TOKEN',
      message: 'Token is invalid or expired',
    });
  }
};
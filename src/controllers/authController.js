import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const name = username; // Map username to name field in schema

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user via Mongoose model
    const newUser = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser, // user.toJSON() strips passwordHash and maps _id to id automatically
    });
  } catch (err) {
    // Step 2: Catch MongoDB unique index duplicate key error (E11000) and return 409
    if (err.code === 11000 || err.message?.includes('E11000')) {
      return res.status(409).json({ error: 'Conflict', message: 'Email address is already registered' });
    }
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email and password required' });
    }

    // Find user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user, // passwordHash stripped automatically via User model toJSON transform
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
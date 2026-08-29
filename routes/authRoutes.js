import express from 'express';
const router = express.Router();

router.post('/register', (req, res) => {
  console.log('BODY RECEIVED:', req.body);
  const { username, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  res.status(201).json({
    message: 'User registered successfully',
    user: { username, email }
  });
});

router.get('/', (req, res) => {
  res.send('auth ok');
});

export default router;
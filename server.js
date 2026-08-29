const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Server running'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
import app from './app.js';
import { connectDb } from './db/connect.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDb();

  app.listen(PORT, () => {
    console.log(`🚀 SyncBoard Server running on http://localhost:${PORT}`);
  });
}

startServer();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedAdmin = require('./config/seed');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'KrishiAI API is running' });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  const dbConnected = await connectDB();

  if (dbConnected) {
    await seedAdmin();
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

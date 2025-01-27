import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getSoilData } from './controllers/soilController';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://smartfarm.joelmbaka.site',
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection with error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Routes
app.get('/api/soil', getSoilData);

// Connect to MongoDB before starting the server
connectDB().then(() => {
  // Test connection endpoint
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Connection successful!',
      timestamp: new Date().toISOString()
    });
  });

  // Health check route
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});
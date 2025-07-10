import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import User from './model/user.js';
import router from './routes/authRoutes.js';

dotenv.config(); // Load env variables first

const app = express(); // ✅ Define app early

// Middleware
app.use(cors());

app.use(express.json());

// Routes
app.use('/api/auth', router);

// Temporary user registration route
app.post('/api/users', async (req, res) => {
  const { email, password } = req.body;

  console.log('📥 Incoming data:', req.body); // Debug

  try {
    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully!', user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Connect to DB and Start Server
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

const connectToDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB!');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);

  }
};

connectToDB();

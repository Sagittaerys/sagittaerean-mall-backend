// const mongoose = require('mongoose');
// require('dotenv')
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
// import User from './model/user';
import User from './model/user.js'; // remember to add .js when importing. Learnt the hard way
import router from './routes/authRoutes.js';


dotenv.config();

const app = express();

const MONGODB_URI = process.env.MONGODB_URI; // to hide the env file later
const PORT = process.env.PORT; // variable that contains the port when it's run loaded from the env file

app.use(express.json()); // middleware..
app.use('/api/auth', router);

app.post('/api/users', async (req, res) => {
  const { email, password } = req.body;

    console.log('📥 Incoming data:', req.body); // Debug line


  try {
    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully!', user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const connectToDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('Connected to MongoDB!');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}!`);
    });

  } catch (error) {
    console.error('Error saving user:', error);
    res.status(400).json({ error: error.message });
  }
};

//note-- always add an application/json as content type in Insomnia!

connectToDB();












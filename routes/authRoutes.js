import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import User from '../model/user.js';
import Cart from '../model/cart.js';
import protect from '../middleware/authMiddleware.js';
import verifyToken from '../middleware/verifyToken.js';

dotenv.config(); // Load environment variables

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET; 
const PORT = process.env.PORT || 4000;

// ---------------------- REGISTER ----------------------
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ---------------------- LOGIN ----------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: `Welcome Back, ${email}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ---------------------- PROFILE ----------------------
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Welcome To Your Profile',
      user,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------------------- ADD TO CART ----------------------
router.post('/cart', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItem = req.body;

    const newCartItem = new Cart({
      userId,
      ...cartItem,
    });

    await newCartItem.save();

    res.status(201).json({ message: 'Cart item saved!', cart: newCartItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------- GET USER CART ----------------------
router.get('/cart', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await Cart.find({ userId });
    res.status(200).json(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//delete



router.delete("/cart/:productId", verifyToken, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const deleted = await Cart.findOneAndDelete({
      userId,
      productId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ message: "Error removing item", error: err.message });
  }
});



export default router;

import express from 'express';
// import bcrypt from 'bcrypt';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
// import User from '../model/user';
import User from '../model/user.js';
import protect from '../middleware/authMiddleware.js';
import verifyToken from '../middleware/verifyToken.js';
import dotenv from 'dotenv';


const router = express.Router();


dotenv.config(); // Load env variables first


const PORT = process.env.PORT || 4000;

//in this scenario since the routes is to register.... we'll create a registration route!

// routes/authRoutes.js

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  //Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use!' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); 

    // Create new user
    const newUser = new User({
      email,
      name,
      password: hashedPassword, // NEVER save plain password
    });

    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      PORT,
      { expiresIn: '1h' }
    );

    // Respond with token and user info
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
}

);
// Working! -- Registration 

//Login Route

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Input Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password!' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      PORT,
      { expiresIn: '1h' }
    );

    // Final response
    res.status(200).json({
      message: `Welcome Back, ${email}`,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
}
); 
//profile route 

router.get('/profile', protect, async (req, res) => {

  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Welcome To Your Profile',
      user
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
})

//add to cart route
router.post("/cart", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // pulled from the token in middleware
    const cartItem = req.body;

    const newCartItem = new Cart({
      userId,
      ...cartItem,
    });

    await newCartItem.save();

    res.status(201).json({ message: "Cart item saved!", cart: newCartItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//logged in user cart
// 
router.get("/cart", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await Cart.find({ userId });
    res.status(200).json(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




export default router;

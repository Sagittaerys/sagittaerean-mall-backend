import jwt from "jsonwebtoken";

import dotenv from 'dotenv';

dotenv.config(); //important! 

const JWT = process.env.JWT_SECRET;

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Received Header:", authHeader);

  // Check if Authorization header exists and starts with "Bearer"

  

  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1]; // Extract the token

    try {
      // Verify token using secret
      console.log("JWT Secret being used:", JWT);

      const decoded = jwt.verify(token, JWT);
      req.user = decoded; 
      next(); // Allow the request to proceed
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ error: 'No token provided' });
  }
};

export default protect;
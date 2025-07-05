import jwt from "jsonwebtoken";
import dotenv from 'dotenv';


dotenv.config(); // Load env variables first

const PORT = process.env.PORT || 4000;
const JWT = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT);
    req.user = decoded; // Attach decoded payload to request
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

export default verifyToken;

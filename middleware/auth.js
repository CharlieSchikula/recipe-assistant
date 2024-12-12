import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express from 'express';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register route
router.post('/register', [
  check('email').isEmail().withMessage('Invalid email format'),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
], async (req, res) => {
  console.log('Register request received'); // Log register request

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // Log validation errors
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = new User({ email, password });

  try {
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ message: 'そのメールアドレスはすでに使用されています。パスワードをお忘れの場合は、パスワードをリセットしてください' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Login route
router.post('/login', [
  check('email').isEmail().withMessage('Invalid email format'),
  check('password').exists().withMessage('Password is required')
], async (req, res) => {
  console.log('Login request received'); // Log login request

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // Log validation errors
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    console.log(`User not found for email: ${email}`); // Log user not found
    return res.status(401).send({ message: '入力されたメールアドレスは登録されていません。' });
  }

  console.log(`User found: ${JSON.stringify(user)}`); // Log the user object

  const isMatch = await user.matchPassword(password); // Use the matchPassword method
  console.log(`Password comparison for ${email}: ${isMatch}`); // Log the result of the password comparison

  if (!isMatch) {
    return res.status(401).send({ message: 'メールアドレスもしくはパスワードが間違っています' });
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  console.log('Token generated:', token); // Log the generated token
  res.send({ token });
});

// Verify token middleware
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader); // Log the Authorization header

  if (!authHeader) {
    return res.status(401).send('Authorization header is missing');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send('Token is missing');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user data from the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    req.user = user; // Attach user data to the req object
    next();
  } catch (err) {
    console.log('Token verification failed:', err); // Log token verification error
    return res.status(401).send({ message: '無効なトークンです。' });
  }
};

// Optional verify token middleware for top page (since not all users are logged in)
export const verifyTokenOptional = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(); // No authorization header, proceed without authentication
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(); // No token, proceed without authentication
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user data from the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(); // User not found, proceed without authentication
    }

    // if the user is logged in, attach user data to the req object
    req.user = user;
  } catch (err) {
    console.log('Token verification failed:', err); // Log token verification error
    // Proceed without authentication
  }
  next();
};

export default router;
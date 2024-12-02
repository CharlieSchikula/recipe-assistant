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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  console.log(`Received password for ${email}: ${password}`); // Log the hashed password

  try {
    const user = new User({ email, password });
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
  console.log('Login request received'); // Log the request
  console.log('Request body:', req.body); // Log the request body

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
  console.log(`Entered password: ${password}`); // Log the entered password
  console.log(`Hashed password from DB: ${user.password}`); // Log the hashed password from the database

  const isMatch = await user.matchPassword(password); // Use the matchPassword method
  console.log(`Password comparison for ${email}: ${isMatch}`); // Log the result of the password comparison

  if (!isMatch) {
    return res.status(401).send({ message: 'メールアドレスもしくはパスワードが間違っています' });
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.send({ token });
});

export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).send({ message: 'トークンが必要です。' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: '無効なトークンです。' });
    }
    req.userId = decoded.userId;
    next();
  });
};

export default router;
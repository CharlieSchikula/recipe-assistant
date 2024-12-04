import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Function to validate the token
function validateToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    return decoded;
  } catch (err) {
    console.error('Token validation failed:', err);
    return null;
  }
}

// Function to make an authenticated API call
async function fetchWithAuth(url, token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
  }

  return response.json();
}

// Example usage
async function checkAuthorization() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzRkNWMwYTkzOWQyMmJiZDQ1MTliNWYiLCJlbWFpbCI6InMuc2NoaWt1bGFAZ21haWwuY29tIiwiaWF0IjoxNzMzMjk1ODI5LCJleHAiOjE3MzMyOTk0Mjl9.5Sx6Zwz4Y_zEmF0PChzli4pHLPkTtWSX7XRTIL5aIrM'; // Replace with your actual JWT token
  console.log('Token:', token);

  const decodedToken = validateToken(token);
  if (!decodedToken) {
    console.error('Invalid token');
    return;
  }

  try {
    const data = await fetchWithAuth('http://localhost:3000/api/protected', token);
    console.log('Protected data:', data);
  } catch (error) {
    console.error('Error fetching protected data:', error);
  }
}

checkAuthorization();
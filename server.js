import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './api/index.js'; // Import the app from index.js

const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
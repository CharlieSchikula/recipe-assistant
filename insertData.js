const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Substitute = require('./models/Substitute'); // Assuming you have a Substitute model

dotenv.config(); // Load environment variables from .env file

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Sample data to insert
    const sampleData = [
      {
        ingredient: '砂糖',
        substitutes: [
          { originalPortion: '10g', substituteName: '蜂蜜', substitutePortion: '7～8g', vegetarian: true },
          { originalPortion: '10g', substituteName: 'メープルシロップ', substitutePortion: '15g', vegetarian: true },
          { originalPortion: '10g', substituteName: 'アガベシロップ', substitutePortion: '7～8g', vegetarian: true }
        ]
      },
      {
        ingredient: '小麦粉',
        substitutes: [
          { originalPortion: '10g', substituteName: '片栗粉', substitutePortion: 'No Info', vegetarian: true },
          { originalPortion: '10g', substituteName: '米粉', substitutePortion: 'No Info', vegetarian: true },
          { originalPortion: '10g', substituteName: '薄力粉', substitutePortion: 'No Info', vegetarian: true },
          { originalPortion: '10g', substituteName: 'アーモンドプードル / アーモンドパウダー / アーモンドフラワー', substitutePortion: 'No Info', vegetarian: true },
          { originalPortion: '10g', substituteName: 'ココナッツ粉', substitutePortion: 'No Info', vegetarian: true },
          { originalPortion: '10g', substituteName: 'オート粉', substitutePortion: 'No Info', vegetarian: true }
        ]
      }
    ];

    // Insert data
    Substitute.insertMany(sampleData)
      .then(() => {
        console.log('Data inserted successfully');
        mongoose.connection.close(); // Close the connection after insertion
      })
      .catch(err => {
        console.error('Error inserting data', err);
        mongoose.connection.close(); // Close the connection on error
      });
  })
  .catch(err => console.error('Could not connect to MongoDB', err));
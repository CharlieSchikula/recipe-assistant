import express from 'express';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import authRoutes from '../middleware/auth.js';
import Substitute from '../models/Substitute.js';
import Favorite from '../models/Favorite.js';
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path'; // Import dirname
import { verifyToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url); // Get the current file URL
const __dirname = dirname(__filename); // Get the directory name

const app = express();
const router = express.Router();

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public'))); // Adjust the path to the public directory

router.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is protected data', user: req.user });
});

// Define the API routes
router.get('/api/recipe', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let title = '';
    const ingredients = [];
    const steps = [];
    let servings = '';
    let advice = '';

    // Scrape title
    title = $('h1').text().trim();

    // Scrape ingredients
    $('#ingredients .ingredient-list > ol > li').each((_, element) => {
      const ingredientName = $(element).find('span').text().trim();
      const ingredientQuantity = $(element).find('bdi').text().trim();
      const ingredientClass = $(element).attr('class'); // Get the class attribute

      ingredients.push({
        name: ingredientName,
        quantity: ingredientQuantity,
        class: ingredientClass // Include the class attribute
      });
    });

    // Scrape servings
    servings = $('#ingredients .mise-icon-text').text().trim();

    // Scrape steps
    $('#steps > ol > li').each((_, element) => {
      const stepHtml = $(element).find("p").html().trim(); // Use html() to preserve HTML tags
      const stepImages = [];
      $(element).find('img').each((_, img) => {
        stepImages.push($(img).attr('src'));
      });
      steps.push({ text: stepHtml, images: stepImages });
    });

    // Scrape advice
    $('#advice > p').each((_, element) => {
      const pHtml = $(element).clone().find('span').remove().end().html().trim();
      advice += `<p>${pHtml}</p> `;
    });
    advice = advice.trim();

    // For debugging
    // console.log('Title:', title);
    // console.log('Ingredients:', ingredients);
    // console.log('Steps:', steps);
    // console.log('Servings:', servings);
    // console.log('Advice:', advice);

    res.json({ title, ingredients, steps, servings, advice });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).send('Error fetching recipe');
  }
});

// Define the substitutes route
router.get('/api/substitutes', async (req, res) => {
  const ingredient = req.query.ingredient;
  if (!ingredient) {
    return res.status(400).send('Ingredient is required');
  }

  try {
    const substitutes = await Substitute.findOne({ ingredient: ingredient });
    if (!substitutes) {
      return res.status(404).send('No substitutes found');
    }
    res.json(substitutes.substitutes);
  } catch (error) {
    console.error('Error fetching substitutes:', error);
    res.status(500).send('Error fetching substitutes');
  }
});

// Add a recipe to the favorite list
router.post('/api/favorites', verifyToken, async (req, res) => {
  const { url } = req.body;
  const email = req.user.email;

  console.log('Query parameters:', req.query); // Log the query parameters
  console.log('User email:', email); // Log the user email

  try {
    const favorite = new Favorite({ email, url });
    await favorite.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove a recipe from the favorite list
router.delete('/api/favorites', verifyToken, async (req, res) => {
  const { url } = req.query;
  const email = req.user.email;

  try {
    await Favorite.findOneAndDelete({ email, url });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if a recipe is in the favorite list
router.get('/api/favorites', verifyToken, async (req, res) => {
  const { url } = req.query;
  const email = req.user.email;

  try {
    const favorite = await Favorite.findOne({ email, url });
    res.json({ isFavorite: !!favorite }); // Convert favorite to a boolean
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch all favorite recipes for the authenticated user
router.get('/api/favorites/all', verifyToken, async (req, res) => {
  const email = req.user.email;

  try {
    const favorites = await Favorite.find({ email });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve the favorite-recipes.html file
router.get('/favorite-recipes', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'favorite-recipes.html'));
});

// Serve the manage-my-substitutes.html file
router.post('/manage-my-substitutes', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'manage-my-substitutes.html'));
});

// Use the router
app.use(router);

export default app;
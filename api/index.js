import express from 'express';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import authRoutes from '../middleware/auth.js';
import Substitute from '../models/Substitute.js';
import Favorite from '../models/Favorite.js';
import MySubstitute from '../models/MySubstitute.js';
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path'; // Import dirname
import { verifyToken, verifyTokenOptional } from '../middleware/auth.js';

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
  let url = req.query.url;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  console.log('URL: ', url); // Log the URL

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Function to extract recipe ID from URL
    function extractRecipeId(url) {
      const match = url.match(/\/recipes\/(\d+)(?:-[^\/]*)?/);
      return match ? match[1] : null;
    }

    let id = extractRecipeId(url);
    let title = '';
    const ingredients = [];
    const steps = [];
    let servings = '';
    let advice = '';

    if (!id) {
      return res.status(400).send('Invalid URL format');
    }
    
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

    res.json({ url, id, title, ingredients, steps, servings, advice });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).send('Error fetching recipe');
  }
});

// Define the API route to fetch only the title of the recipe
router.get('/api/recipe/title', async (req, res) => {
  let url = req.query.url;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Scrape title
    const title = $('h1').text().trim();

    res.json({ title });
  } catch (error) {
    console.error('Error fetching recipe title:', error); // Log the error
    res.status(500).send('Error fetching recipe title');
  }
});

// Define the substitutes route for authenticated and unauthenticated users
router.get('/api/substitutes', verifyTokenOptional, async (req, res) => {
  console.log('Query Parameters: ', req.query); // Log the query parameters
  console.log('User: ', req.user); // Log the user object
  const ingredient = req.query.ingredient;
  if (!ingredient) {
    return res.status(400).send('Ingredient is required');
  }

  try {
    let mySubstitutes = [];
    if (req.user) {
      const email = req.user.email;
      // Fetch user's my-substitutes if authenticated
      const userSubstitutes = await MySubstitute.find({
        email,
        ingredient: { $regex: `(^|\\s|[\\/／]|\\b)${ingredient}(\\s|[\\/／]|\\b|$)`, $options: 'i' } // Case-insensitive search
      });
      mySubstitutes = userSubstitutes ? userSubstitutes.map(sub => sub.mySubstitutes).flat() : [];
      console.log('User Substitutes: ', mySubstitutes); // Log user substitutes
    }

    // Fetch basic data for all users
    const basicSubstitutes = await Substitute.find({
      ingredient: { $regex: `(^|\\s|[\\/／]|\\b)${ingredient}(\\s|[\\/／]|\\b|$)`, $options: 'i' } // Case-insensitive search
    });
    const basicSubstitutesList = basicSubstitutes ? basicSubstitutes.map(sub => sub.substitutes).flat() : [];
    console.log('Basic Substitutes: ', basicSubstitutesList); // Log basic substitutes

    // Combine results
    const combinedSubstitutes = {
      mySubstitutes,
      basicSubstitutes: basicSubstitutesList
    };

    res.json(combinedSubstitutes);
  } catch (error) {
    console.error('Error fetching substitutes:', error);
    res.status(500).send('Error fetching substitutes');
  }
});

// Add a recipe to the favorite list
router.post('/api/favorites', verifyToken, async (req, res) => {
  const { recipeId, url, title } = req.body;
  const email = req.user.email;

  console.log('Query Parameters: ', req.query); // Log the query parameters
  console.log('User: ', email); // Log the user email
  console.log('Recipe ID: ', recipeId); // Log the recipe ID
  console.log('URL: ', url); // Log the URL

  try {
    let favorite = await Favorite.findOne({ email });
    if (!favorite) {
      favorite = new Favorite({ email, favorites: [{ recipeId, url, title }] });
    } else {
      favorite.favorites.push({ recipeId, url, title });
    }
    await favorite.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding to favorites:', error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove a recipe from the favorite list
router.delete('/api/favorites', verifyToken, async (req, res) => {
  const { url } = req.query;
  const email = req.user.email;

  try {
    const favorite = await Favorite.findOne({ email });
    if (favorite) {
      favorite.favorites = favorite.favorites.filter(fav => fav.url !== url);
      await favorite.save();
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from favorites:', error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if a recipe is in the favorite list and update the title if necessary
router.get('/api/favorites', verifyToken, async (req, res) => {
  const { url, title } = req.query;
  const email = req.user.email;

  try {
    const favorite = await Favorite.findOne({ email, 'favorites.url': url });
    if (favorite) {
      const existingRecipeIndex = favorite.favorites.findIndex(fav => fav.url === url);
      if (existingRecipeIndex !== -1) {
        // Update the title if the recipe already exists
        favorite.favorites[existingRecipeIndex].title = title;
        console.log("Title Updated In Favorites: " + title);
        await favorite.save();
      }
    }
    res.json({ isFavorite: !!favorite }); // Convert favorite to a boolean
  } catch (error) {
    console.error('Error checking if favorite:', error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch all favorite recipes for the authenticated user
router.get('/api/favorites/all', verifyToken, async (req, res) => {
  console.log("User: " + req.user);
  const email = req.user.email;

  try {
    const favorite = await Favorite.findOne({ email });
    res.json(favorite ? favorite.favorites : []);
  } catch (error) {
    console.error('Error fetching all favorites:', error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch all my-substitutes for the authenticated user
router.get('/api/my-substitutes', verifyToken, async (req, res) => {
  const email = req.user.email;

  console.log('Fetching Substitutes For User: ', email); // Log the user email

  try {
    const substitutes = await MySubstitute.find({ email });
    res.json(substitutes);
  } catch (error) {
    console.error('Error fetching substitutes:', error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add or update a substitute in the my-substitutes list
router.post('/api/my-substitutes', verifyToken, async (req, res) => {
  const { ingredient, mySubstitutes } = req.body;
  const email = req.user.email;

  console.log('Adding Or Updating Substitute For User: ', email); // Log the user email
  console.log('Ingredient: ', ingredient); // Log the ingredient
  console.log('Substitutes: ', mySubstitutes); // Log the substitutes

  try {
    let substitute = await MySubstitute.findOne({ email, ingredient });
    if (!substitute) {
      substitute = new MySubstitute({ email, ingredient, mySubstitutes });
    } else {
      mySubstitutes.forEach(newSub => {
        const existingSub = substitute.mySubstitutes.id(newSub._id);
        if (existingSub) {
          existingSub.originalPortion = newSub.originalPortion;
          existingSub.substituteName = newSub.substituteName; // Update the name
          existingSub.substitutePortion = newSub.substitutePortion;
          existingSub.vegetarian = newSub.vegetarian;
        } else {
          substitute.mySubstitutes.push(newSub);
        }
      });
    }
    await substitute.save();
    res.json({ success: true, substitute });
  } catch (error) {
    console.error('Error adding or updating substitute:', error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update ingredient name in the my-substitutes list
router.put('/api/my-substitutes/ingredient/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { newIngredientName } = req.body;
  const email = req.user.email;

  console.log('Updating Ingredient For User: ', email); // Log the user email
  console.log('Ingredient ID: ', id); // Log the ingredient ID
  console.log('New Ingredient Name: ', newIngredientName); // Log the new ingredient name

  try {
    const substitute = await MySubstitute.findOne({ email, _id: id });
    if (!substitute) {
      return res.status(404).json({ success: false, message: 'Substitute not found' });
    }

    // Check for duplicate ingredient name
    const duplicate = await MySubstitute.findOne({ email, ingredient: newIngredientName });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'その材料名はすでに登録されています' });
    }

    substitute.ingredient = newIngredientName;
    await substitute.save();
    res.json({ success: true, substitute });
  } catch (error) {
    console.error('Error updating ingredient:', error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove ingredient from the my-substitutes list
router.delete('/api/my-substitutes/ingredient/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const email = req.user.email;

  console.log('Deleting ingredient for user:', email); // Log the user email
  console.log('Ingredient ID:', id); // Log the ingredient ID

  try {
    const result = await MySubstitute.deleteOne({ email, _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }

    res.json({ success: true, message: 'Ingredient deleted' });
  } catch (error) {
    console.error('Error deleting ingredient:', error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a substitute in the my-substitutes list
router.put('/api/my-substitutes/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { ingredient, mySubstitutes } = req.body;
  const email = req.user.email;

  console.log('Updating Substitute For (User: ', email); // Log the user email
  console.log('Ingredient: ', ingredient); // Log the ingredient
  console.log('Substitutes: ', mySubstitutes); // Log the substitutes

  try {
    let substitute = await MySubstitute.findOne({ email, ingredient });
    if (!substitute) {
      return res.status(404).json({ success: false, message: 'Substitute not found' });
    }

    const existingSub = substitute.mySubstitutes.id(id);
    if (existingSub) {
      const newSub = mySubstitutes[0];
      existingSub.originalPortion = newSub.originalPortion;
      existingSub.substituteName = newSub.substituteName; // Update the name
      existingSub.substitutePortion = newSub.substitutePortion;
      existingSub.vegetarian = newSub.vegetarian;
      await substitute.save();
      res.json({ success: true, substitute });
    } else {
      res.status(404).json({ success: false, message: 'Substitute not found' });
    }
  } catch (error) {
    console.error('Error updating substitute:', error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove a substitute from the my-substitutes list
router.delete('/api/my-substitutes/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const email = req.user.email;

  console.log('Removing Substitute For User: ', email); // Log the user email
  console.log('Substitute ID: ', id); // Log the substitute ID

  try {
    const substitutes = await MySubstitute.find({ email });
    if (substitutes.length > 0) {
      let found = false;
      for (const substitute of substitutes) {
        const initialLength = substitute.mySubstitutes.length;
        substitute.mySubstitutes = substitute.mySubstitutes.filter(sub => sub._id.toString() !== id);
        if (substitute.mySubstitutes.length !== initialLength) {
          found = true;
          if (substitute.mySubstitutes.length === 0) {
            // If no other mySubstitutes, delete the parent document
            await MySubstitute.deleteOne({ _id: substitute._id });
            console.log('Parent Document Deleted: ', substitute._id); // Log the deleted parent document ID
          } else {
            await substitute.save();
            console.log('Substitute Removed: ', id); // Log the removed substitute ID
          }
        }
      }

      if (!found) {
        console.log('Substitute Not Found In Any List: ', id); // Log the substitute ID not found
        return res.status(404).json({ success: false, message: 'Substitute not found' });
      }

      res.json({ success: true });
    } else {
      console.log('No Substitutes Found For User: ', email); // Log no substitutes found for user
      res.status(404).json({ success: false, message: 'Substitute not found' });
    }
  } catch (error) {
    console.error('Error Removing Substitute: ', error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve the favorite-recipes.html file
router.get('/favorite-recipes', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'favorite-recipes.html'));
});

// Serve the my-substitutes.html file
router.get('/my-substitutes', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'my-substitutes.html'));
});

// Use the router
app.use(router);

export default app;
import axios from 'axios';
import express from 'express';
import { Users, MealPlans } from '../../db/mock.js';

const router = express.Router();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_API_URL = 'https://api.spoonacular.com/recipes/complexSearch';

// GET /meals/search?meal=<name>&diets=<preferences>
router.get('/search', async (req, res) => {
    try {
        const userId = Number(req.headers.user_id);
        const user = Users.users.find((user) => user._id === userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const meal = req.query.meal;
        const diets = req.query.diets || user.preferences.join(',');

        const response = await axios.get(SPOONACULAR_API_URL, {
            params: {
                apiKey: SPOONACULAR_API_KEY,
                query: meal,
                diets: diets
            }
        });

        if (!response.data.results || response.data.results.length === 0) {
            return res.status(404).json({ message: 'No meals found for the specified criteria.' });
        }

        res.json(response.data.results);
    } catch (error) {
        console.error('Error fetching meals:', error);
        res.status(500).json({ error: error.toString() });
    }
});

export default router;

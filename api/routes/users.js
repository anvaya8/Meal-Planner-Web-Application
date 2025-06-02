import express from 'express';
import { Users, MealPlans } from '../../db/mock.js'; 

const router = express.Router();

// POST /users/register
router.post('/register', (req, res) => {
    // Get username, password, and preferences from the request body
    const username = req.body.username;
    const password = req.body.password;
    const preferences = req.body.preferences || []; // Default to an empty array if not provided

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(422).json({ error: 'Username and password are required.' });
    }

    // Check if the username already exists
    const userExists = Users.find('username', username);
    if (userExists) {
        return res.status(409).json({ error: 'Username already exists.' });
    }

    // Add the new user
    const newUser = Users.add({ username, password, preferences });
    res.status(201).json({ _id: newUser._id, username: newUser.username, preferences: newUser.preferences });
});

// POST /users/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(422).json({ error: 'Username and password are required.' });
    }

    // Find the user by username
    const user = Users.find('username', username);
    
    // Check if user exists and if the password matches
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // If successful, respond with user details
    res.json({ _id: user._id, username: user.username, preferences: user.preferences });
});

// GET /users/:id
router.get('/:id', (req, res) => {
    // Convert the user_id from the headers and the id from the URL to numbers
    const headerUserId = Number(req.headers.user_id);
    const urlUserId = Number(req.params.id);

    // Check if the user_id in the header matches the one in the URL
    if (headerUserId !== urlUserId) {
        return res.status(403).json({ error: 'Access denied: user ID mismatch.' });
    }

    // Find the user in the Users list
    const user = Users.find('_id', urlUserId);
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    // Find the meal plans for this user
    const mealPlans = MealPlans.findAll(urlUserId);

    // Send the user info and associated meal plans
    res.json({
        _id: user._id,
        username: user.username,
        preferences: user.preferences,
        mealPlans: mealPlans
    });
});



// PUT /users/:id
router.put('/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const headerUserId = parseInt(req.headers.user_id);

    // Check if the user IDs match
    if (userId !== headerUserId) {
        return res.status(403).json({ error: 'Access denied: user ID mismatch.' });
    }

    // Get preferences from the request body
    const preferences = req.body.preferences;
    
    // Update the user's preferences
    const updatedUser = Users.update(userId, preferences);
    if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
    }

    // Return updated user information
    res.json({ _id: updatedUser._id, username: updatedUser.username, preferences: updatedUser.preferences });
});

export default router;

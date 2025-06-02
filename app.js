import 'dotenv/config'; // Load environment variables from .env file
import express from 'express'; // Import Express framework
import users from './api/routes/users.js'; // Users router
import mealplans from './api/routes/mealplans.js'; // Meal plans router
import meals from './api/routes/meals.js'; // Meals router

const app = express(); // Create an Express application
const PORT = 8080; // Define the port for the server

app.use(express.json()); // Enable JSON body parsing

// Logging middleware for requests
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

// Handle all requests to /users route with users router
app.use('/users', users);

// Handle all requests to /mealplans route with mealplans router
app.use('/mealplans', mealplans);

// Handle all requests to /meals route with meals router
app.use('/meals', meals);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

import express from 'express';
import { MealPlans, Users } from '../../db/mock.js';

const router = express.Router();

// POST /mealplans
router.post('/', (req, res) => {
    const userId = parseInt(req.headers.user_id); // Get user ID from header
    const mealplan = req.body; // Get meal plan details from request body
    const mealId = mealplan.meal.mealId; // Extract mealId from request

    console.log(`POST request for '/mealplans'`);
    console.log(`User ID from header: ${userId}`);
    console.log(`Received meal plan: ${JSON.stringify(mealplan)}`);

    // Find the user in the Users list
    const user = Users.find('_id', userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    // Find the existing meal plan for the user and week
    const existingMealPlan = MealPlans.find(userId, mealplan.week);
    console.log(`Existing Meal Plan: ${JSON.stringify(existingMealPlan)}`);

    // Flag to check if the mealId belongs to the current user and its index
    let mealExistsForUser = false;
    let mealIndex = -1;

    if (existingMealPlan) {
        // Check if the mealId exists in the current user's meal plan
        for (let i = 0; i < existingMealPlan.meals.length; i++) {
            if (existingMealPlan.meals[i].mealId === mealId) {
                mealExistsForUser = true;
                mealIndex = i;
                break;
            }
        }
    }

    // If mealId exists for this user, update the meal
    if (mealExistsForUser) {
        console.log(`Updating existing meal with ID: ${mealId}`);
        existingMealPlan.meals[mealIndex] = mealplan.meal; // Update the meal with new details
        console.log(`Updated Meal Plan: ${JSON.stringify(existingMealPlan)}`);
        return res.status(200).json(existingMealPlan);
    } else {
        // If mealId does not exist for this user
        // Check if the mealId belongs to another user
        const allMealPlans = MealPlans.mealplans; // Get all meal plans
        let mealExistsForOtherUser = false;

        for (let i = 0; i < allMealPlans.length; i++) {
            if (allMealPlans[i].user_id !== userId) {
                // Check if the mealId exists in another user's meal plan
                for (let j = 0; j < allMealPlans[i].meals.length; j++) {
                    if (allMealPlans[i].meals[j].mealId === mealId) {
                        mealExistsForOtherUser = true;
                        break;
                    }
                }
            }
            if (mealExistsForOtherUser) break; // Exit loop if mealId found for another user
        }

        if (mealExistsForOtherUser) {
            // Meal belongs to another user, return user ID mismatch
            console.log(`Access denied: Meal ID ${mealId} belongs to another user.`);
            return res.status(403).json({ error: 'Access denied: meal ID belongs to another user.' });
        } else {
            // Meal does not belong to another user, check if the current user can add the meal
            if (existingMealPlan && existingMealPlan.meals.length >= 3) {
                // Meal plan already contains 3 meals, return an error
                console.log(`Meal plan already contains 3 meals. Cannot add more.`);
                return res.status(400).json({ error: 'Meal plan already contains 3 meals. Cannot add new meal.' });
            }

            // Add the meal to the current user's meal plan or create a new plan if none exists
            if (existingMealPlan) {
                existingMealPlan.meals.push(mealplan.meal);
                console.log(`Meal added to existing plan: ${JSON.stringify(existingMealPlan)}`);
                return res.status(200).json(existingMealPlan);
            } else {
                const newMealPlan = {
                    _id: MealPlans.mealplans.length + 1,
                    user_id: userId,
                    week: mealplan.week,
                    meals: [mealplan.meal]
                };

                MealPlans.mealplans.push(newMealPlan);
                console.log(`Created new meal plan: ${JSON.stringify(newMealPlan)}`);
                return res.status(201).json(newMealPlan);
            }
        }
    }
});


// GET /mealplans
router.get('/', (req, res) => {
    const userId = parseInt(req.headers.user_id);
    const mealPlans = MealPlans.findAll(userId);
    res.json(mealPlans);
});

// DELETE /mealplans/:id
router.delete('/:id', async (req, res) => {
    try {
        const userId = Number(req.headers.user_id); // Extract user_id from headers
        const mealplanId = Number(req.params.id); // Extract meal plan ID from the URL

        // Find the meal plan for the current user by user ID
        const mealPlanIndex = MealPlans.mealplans.findIndex(plan => plan.user_id === userId);
        
        // Check if meal plan was found for the user
        if (mealPlanIndex === -1) {
            return res.status(404).json({ error: 'Meal plan not found for the current user.' });
        }

        const mealPlan = MealPlans.mealplans[mealPlanIndex];

        // Find the index of the meal to be deleted within the user's meal plan
        let mealIndex = -1;
        for (let i = 0; i < mealPlan.meals.length; i++) {
            if (mealPlan.meals[i].mealId === mealplanId) {
                mealIndex = i;
                break;
            }
        }

        // If the meal was not found in the user's plan, check if it belongs to another user
        if (mealIndex === -1) {
            let mealExistsForOtherUser = false;

            for (let i = 0; i < MealPlans.mealplans.length; i++) {
                const otherPlan = MealPlans.mealplans[i];
                if (otherPlan.user_id !== userId) {
                    for (let j = 0; j < otherPlan.meals.length; j++) {
                        if (otherPlan.meals[j].mealId === mealplanId) {
                            mealExistsForOtherUser = true;
                            break;
                        }
                    }
                }
                if (mealExistsForOtherUser) break;
            }

            // If meal belongs to another user, return access denied error
            if (mealExistsForOtherUser) {
                return res.status(403).json({ error: 'Access denied: Meal ID belongs to another user.' });
            }

            // If the meal doesn't exist anywhere, return meal not found error
            return res.status(404).json({ error: 'Meal not found in this meal plan.' });
        }

        // Remove the meal from the user's meal plan
        mealPlan.meals = mealPlan.meals.filter(meal => meal.mealId !== mealplanId);

        // If no meals are left, remove the meal plan itself
        if (mealPlan.meals.length === 0) {
            MealPlans.mealplans = MealPlans.mealplans.filter(plan => plan.user_id !== userId || plan.week !== mealPlan.week);
            return res.json({ message: 'Meal plan deleted successfully.', _id: mealplanId });
        }

        // Return success message
        res.json({ message: 'Meal deleted successfully.', _id: mealplanId });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

export default router;

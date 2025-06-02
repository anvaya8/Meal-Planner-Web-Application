const Users = {
    users: [
        {
            _id: 1,
            username: 'prof_auman',
            password: 'future_hashed_password',
            preferences: ['ketogenic']
        },
        {
            _id: 2,
            username: 'anvaya_sreesha',
            password: 'abcdf', 
            preferences: ['vegetarian', 'gluten free']
        }
    ],

    find(key, value) {
        return this.users.find((user) => user[key] === value);
    },

    add(user) {
        const addUser = { ...user, _id: this.users.length + 1 };
        this.users.push(addUser);
        return addUser;
    },

    update(userId, preferences) {
        const user = this.find('_id', userId);
        if (!user) {
            return null;
        }
        user.preferences = preferences;
        return user;
    }
};
const MealPlans = {
    mealplans: [
        {
            _id: 1,
            user_id: 1,
            week: 1,
            meals: [
                {
                    mealId: 1591791,
                    name: 'Keto Snickerdoodle Coffee',
                    diets: ['gluten free', 'lacto ovo vegetarian', 'primal', 'ketogenic'],
                    image: 'https://img.spoonacular.com/recipes/1591791-312x231.jpg'
                },
                {
                    mealId: 1652621,
                    name: 'Keto Pancakes',
                    diets: ['gluten free', 'dairy free', 'lacto ovo vegetarian', 'ketogenic'],
                    image: 'https://img.spoonacular.com/recipes/1652621-312x231.jpg'
                }
            ]
        },
        {
            _id: 2,
            user_id: 2,
            week: 1,
            meals: [
                {
                    mealId: 154234,
                    name: 'Vegetarian Chili',
                    diets: ['vegetarian', 'gluten free'],
                    image: 'https://img.spoonacular.com/recipes/154234-312x231.jpg'
                },
                {
                    mealId: 156321,
                    name: 'Quinoa Salad',
                    diets: ['vegetarian', 'gluten free'],
                    image: 'https://img.spoonacular.com/recipes/156321-312x231.jpg'
                },
                {
                    mealId: 154335,
                    name: 'Stuffed Bell Peppers',
                    diets: ['Dairy Free', 'Gluten Free', 'Vegetarian'],
                    image: 'https://img.spoonacular.com/recipeImages/146857-312x231.jpg'
                }
            ]
        }
    ],

    findAll(userId) {
        // find all meal plans associated to a user by user_id
        return this.mealplans.filter((mealplan) => mealplan.user_id === userId);
    },

    find(userId, week) {
        // find a meal plan by user_id and week
        return this.mealplans.find((mealplan) => mealplan.user_id === userId && mealplan.week === week);
    },

    add(mealplan, mealplanId) {
        // if mealplanId is provided then we find the existing meal plan and add a meal
        if (mealplanId) {
            const idx = this.mealplans.findIndex((mealplan) => mealplan._id === mealplanId);

            this.mealplans[idx].meals.push(mealplan.meal);
            return this.mealplans[idx];
        }

        // if no mealplanId is provided then we know we need to create a new meal plan with the meal
        const addMealPlan = {
            _id: this.mealplans.length + 1,
            user_id: mealplan.user_id,
            week: mealplan.week,
            meals: [mealplan.meal]
        };
        this.mealplans.push(addMealPlan);

        return addMealPlan;
    },

    delete(mealplanId) {
        this.mealplans = this.mealplans.filter((mealplan) => mealplan._id !== mealplanId);

        return mealplanId;
    }
};

export { Users, MealPlans };

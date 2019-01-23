module.exports = function (app, Recipe, Ingredient, Category) {
    
    // get all ingredients
    app.get('/ingredients', function (req, res) {
        Ingredient.find({}, '_id name imgUrl').sort({name: 1}).exec(function (err, allIngredients) {
            if (err) {
                console.error(err);
            }
            if (!allIngredients.length) {
                return res.status(403).json({
                    status: 403,
                    message: "Get ingredients failed: no ingredients found in database"
                });
            } else {
                return res.json(allIngredients);
            }
        });
    });

    // get list of categories
    app.get('/categories', function (req, res) {
            Category.find({}, '_id name').sort({name: 1}).exec(function (err, categories) {
            if (err) {
                console.error(err);
            }
            if (!categories.length) {
                return res.status(403).json({
                    status: 403,
                    message: "Get categories failed: no categories found in database"
                });
            } else {
                return res.json(categories);
            }
        }); 
    });
};
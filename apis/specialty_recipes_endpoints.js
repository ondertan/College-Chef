module.exports = function (app, Recipe, IngredientToRecipe, Ingredient, Rate, Favorite, Comment) {

    // search recipes by ingredients
    app.post('/search', function (req, res) {
        if (!req.body.ingredients) {
            return res.status(400).json({
                status: 400,
                message: "SEARCH FAILURE: Bad Request (no ingredients passed)"
            });
        }
        if (!req.query.searchtype) {
            return res.status(400).json({
                status: 400,
                message: "SEARCH FAILURE: Bad Request (no searchtype passed)"
            });
        }
        // check if input query are valid
        var validValues = ["powerset", "include", "equal", "exclude"];
        var valueValid = true;
        if (validValues.indexOf(req.query.searchtype) < 0) {
            valueValid = false;
        }
        if (!valueValid) {
            return res.status(400).json({
                error: 400,
                message: "SEARCH FAILURE: Bad Request (Invalid searchtype value)"
            });
        }

        var numOfIngredients = req.body.ingredients.length;
        var equalCheck = {"$match": {"ingredientCount": {"$gt": 0}}};
        if (req.query.searchtype == "equal") {
            equalCheck = {"$match": {"ingredientCount": {"$eq": numOfIngredients}}};
        }
        // ingredient id filter for "equal" and "include"
        var findContainsIngredients = {"$setIsSubset": [req.body.ingredients, "$ingredientIdSet"]};
        if (req.query.searchtype == "exclude") {
            // ingredient id filter for "exclude"
            findContainsIngredients = {"$not": findContainsIngredients};
        } else if (req.query.searchtype == "powerset") {
            // ingredient id filter for "powerset"
            findContainsIngredients = {"$setIsSubset": ["$ingredientIdSet", req.body.ingredients]};
        }
        IngredientToRecipe.aggregate(
            [
                // group by recipe id
                {"$group": {
                    "_id": "$recipeId",
                    "ingredientCount": {"$sum": 1},
                    "ingredients": {"$push": {"ingredientId": "$ingredientId", "amount": "$amount"}},
                    "ingredientIdSet": {"$push": "$ingredientId"}
                }},
                // find records with correct ingredient count
                equalCheck,
                // check if all ingredients required is present
                {"$project": {
                    "_id": 0,
                    "recipeId": "$_id",
                    "ingredients": 1,
                    "ingredientIdSet": 1,
                    "correct": findContainsIngredients
                }},
                {"$match": {"correct": {"$eq": true}}},
                // join recipe details by id
                {"$lookup": {
                    from: "recipes",
                    localField: "recipeId",
                    foreignField: "_id",
                    as: "recipe"
                }},
                {$unwind: "$recipe"},
                // removed deleted recipes
                {"$match": {"recipe.isDeleted": {"$eq": false}}},
                // return only an array of result recipes with wanted fields
                {"$project": {
                    "recipeId": 1,
                    "recipeName": "$recipe.recipeName",
                    "description": "$recipe.description",
                    "imgUrl": "$recipe.imgUrl"
                }}
            ], function (err, resultRecipes) {
                res.json(resultRecipes);
            }
        );
    });

    // get hot (mostly commented) recipes
    app.get("/recipes/hot", function (req, res) {
        Comment.aggregate(
            [
                // group by recipe id and count num of comments
                {"$group": {
                    "_id": "$recipeId",
                    "commentCount": {"$sum": 1}
                }},
                // sort by commentCount
                {"$sort": {"commentCount": -1}},
                // get only first 10
                {"$limit" : 10 },
                // join recipe details by id
                {"$lookup": {
                    from: "recipes",
                    localField: "_id",
                    foreignField: "_id",
                    as: "recipes"
                }},
                {$unwind: "$recipes"},
                // removed deleted recipes
                {"$match": {"recipes.isDeleted": {"$eq": false}}},
                // set return fields
                {"$project": {
                    "_id": "$recipes._id",
                    "commentCount": 1,
                    "recipeName": "$recipes.recipeName",
                    "description": "$recipes.description",
                    "imgUrl": "$recipes.imgUrl"
                }}
            ], function (err, resultRecipes) {
                res.json(resultRecipes);
            }
        );
    });
    
    // get remarkable (highest rated) recipes
    app.get("/recipes/remarkable", function (req, res) {
        Rate.aggregate(
            [
                // group by recipe id and calculate average scores
                {"$group": {
                    "_id": "$recipeId",
                    "avgScore": {"$avg": "$scores"}
                }},
                // sort by avgScore
                {"$sort": {"avgScore": -1}},
                // get only first 10
                {"$limit" : 10 },
                // join recipe details by id
                {"$lookup": {
                    from: "recipes",
                    localField: "_id",
                    foreignField: "_id",
                    as: "recipes"
                }},
                {$unwind: "$recipes"},
                // removed deleted recipes
                {"$match": {"recipes.isDeleted": {"$eq": false}}},
                // set return fields
                {"$project": {
                    "_id": "$recipes._id",
                    "avgScore": 1,
                    "recipeName": "$recipes.recipeName",
                    "description": "$recipes.description",
                    "imgUrl": "$recipes.imgUrl"
                }}
            ], function (err, resultRecipes) {
                res.json(resultRecipes);
            }
        );
    });
    
    // get new recipes
    app.get("/recipes/new", function (req, res) {
        Recipe.aggregate(
            [
                // removed deleted recipes
                {"$match": {"isDeleted": {"$eq": false}}},
                // sort by ModifiedDate
                {"$sort": {"ModifiedDate": -1}},
                // get only first 10
                {"$limit" : 10 },
                // set return fields
                {"$project": {
                    "ModifiedDate": 1,
                    "recipeName": 1,
                    "description": 1,
                    "imgUrl": 1
                }}
            ], function (err, resultRecipes) {
                res.json(resultRecipes);
            }
        );
    });
    
    // get favorited recipes
    app.get("/recipes/favorite", function (req, res) {
        if (req.auth) {
            var userId = parseInt(req.userID);
            Favorite.aggregate(
                [
                    // find records of current user
                    {"$match": {"personId": {"$eq": userId}}},
                    // join with recipe table
                    {"$lookup": {
                        from: "recipes",
                        localField: "recipeId",
                        foreignField: "_id",
                        as: "recipe"
                    }},
                    {$unwind: "$recipe"},
                    // removed deleted recipes
                    {"$match": {"recipe.isDeleted": {"$eq": false}}},
                    // set return fields
                    {"$project": {
                        "_id": "$recipe._id",
                        "recipeName": "$recipe.recipeName",
                        "description": "$recipe.description",
                        "imgUrl": "$recipe.imgUrl"
                    }}
                ], function (err, resultRecipes) {
                    res.json(resultRecipes);
                }
            );
        } else {
            return res.status(401).json({
                status: 401,
                message: "GET FAVORITE RECIPES FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });
    
    // get recipes uploaded by specified user
    app.post("/recipes/uploaded", function (req, res) {
        if (req.auth) {
            // default to get current user's uploaded recipes if userName not specified
            var specifiedUser = req.userName;
            if (req.body.userName) {
                specifiedUser = req.body.userName;
            }
            Recipe.aggregate(
                [
                    // removed deleted recipes
                    {"$match": {"isDeleted": {"$eq": false}}},
                    // join with user table
                    {"$lookup": {
                        from: "users",
                        localField: "personId",
                        foreignField: "_id",
                        as: "user"
                    }},
                    // find recipes uploaded by user with userName specifiedUser
                    {"$match": {"user.userName": {"$eq": specifiedUser}}},
                    // set return fields
                    {"$project": {
                        "recipeName": 1,
                        "description": 1,
                        "imgUrl": 1
                    }}
                ], function (err, resultRecipes) {
                    res.json(resultRecipes);
                }
            );
        } else {
            return res.status(401).json({
                status: 401,
                message: "GET UPLOADED RECIPES FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });

};
module.exports = function (app, isDefined, Recipe, IngredientToRecipe, Rate, ActionHistory, ActionType) {
    // get all recipes
    app.get('/recipes', function (req, res) {
        var filter = [];
        // exclude deleted recipes
        filter.push({"$match": {"isDeleted": {"$eq": false}}});
        // get uploader info
        filter.push(
            {"$lookup": {
                from: "users",
                localField: "personId",
                foreignField: "_id",
                as: "uploader"
            }});
        filter.push({$unwind: "$uploader"});
        // filter by username
        if (req.query.username) {
            filter.push({"$match": {"uploader.userName": {"$eq": req.query.username}}});
        }
        // get category info
        filter.push(
            {"$lookup": {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }});
        filter.push({$unwind: "$category"});
        // filter by category
        if (req.query.category) {
            filter.push({"$match": {"category.name": {"$eq": req.query.category}}});
        }
        // set return fields
        filter.push(
            {"$project": {
                "recipeName": 1,
                "description": 1,
                "imgUrl": 1,
                "uploaderName": "$uploader.userName",
                "categoryName": "$category.name"
            }}
        );
        Recipe.aggregate([filter], function (err, allRecipes) {
                if (err) {
                    return console.error(err);
                }
                res.json(allRecipes);
            }
        );
    });

    var getRecipeDetail = function (req, res, recipeId) {
        Rate.aggregate(
            [
                // find records of required recipe
                {"$match": {"recipeId": {"$eq": recipeId}}},
                // group by recipe id and calculate average scores
                {"$group": {
                    "_id": "$recipeId",
                    "avgScore": {"$avg": "$scores"}
                }}
            ], function (err, rateAvg) {
                var rating = 0;
                if (rateAvg.length) {
                    rating = rateAvg[0].avgScore;
                }

                // find recipe infos
                Recipe.aggregate(
                    [
                        // find specified recipe
                        {"$match": {"_id": {"$eq": recipeId}}},
                        // exclude deleted
                        {"$match": {"isDeleted": {"$eq": false}}},
                        // join to get ingredients ids and amount
                        {"$lookup": {
                            from: "ingredienttorecipes",
                            localField: "_id",
                            foreignField: "recipeId",
                            as: "ingredientsIds"
                        }},
                        // join to get ingredients name and img
                        {"$unwind": "$ingredientsIds"},
                        {"$lookup": {
                            from: "ingredients",
                            localField: "ingredientsIds.ingredientId",
                            foreignField: "_id",
                            as: "ingredientsDetails"
                        }},
                        { "$unwind": "$ingredientsDetails" },
                        { "$group": {
                            "_id": "$_id",
                            "personId": {$first: "$personId"},
                            "recipeName": {$first: "$recipeName"},
                            "categoryId": {$first: "$categoryId"},
                            "description": {$first: "$description"},
                            "instruction": {$first: "$instruction"},
                            "imgUrl": {$first: "$imgUrl"},
                            "notes": {$first: "$notes"},
                            "numServings": {$first: "$numServings"},
                            "ModifiedById": {$first: "$ModifiedById"},
                            "ModifiedDate": {$first: "$ModifiedDate"},
                            "avgRating": {$first: "$avgRating"},
                            "ingredients": {"$push":
                                {
                                    "ingredientId": "$ingredientsIds.ingredientId",
                                    "amount": "$ingredientsIds.amount",
                                    "name": "$ingredientsDetails.name",
                                    "imgUrl": "$ingredientsDetails.imgUrl",
                                }},
                        }},
                        // join to get user info
                        {"$lookup": {
                            from: "users",
                            localField: "personId",
                            foreignField: "_id",
                            as: "uploader"
                        }},
                        {$unwind: "$uploader"},
                        // join to get modifier info
                        {"$lookup": {
                            from: "users",
                            localField: "ModifiedById",
                            foreignField: "_id",
                            as: "modifier"
                        }},
                        {$unwind: "$modifier"},
                        // join to get category name
                        {"$lookup": {
                            from: "categories",
                            localField: "categoryId",
                            foreignField: "_id",
                            as: "category"
                        }},
                        {$unwind: "$category"},
                        // set return fields
                        {"$project": {
                            "_id": 0,
                            "recipeId": "$_id",
                            "recipeName": 1,
                            "description": 1,
                            "instruction": 1,
                            "imgUrl": 1,
                            "numServings": 1,
                            "ModifiedDate": 1,
                            "notes": 1,
                            "uploaderId": "$uploader._id",
                            "uploaderName": "$uploader.userName",
                            "uploaderImg": "$uploader.profilePhoto",
                            "modifierId": "$modifier._id",
                            "modifierName": "$modifier.userName",
                            "categoryId": "$category._id",
                            "categoryName": "$category.name",
                            "ingredients": 1
                        }}
                    ], function (err, resultRecipes) {
                        if (err) {
                            return console.error(err);
                        }
                        if (resultRecipes.length) {
                            // add rating
                            resultRecipes[0]["avgRating"] = rating;

                            return res.json(resultRecipes[0]);
                        } else {
                            return res.status(404).json({
                                status: 404,
                                message: "GET RECIPE FAILURE: Bad Request (recipe not found)"
                            });
                        }
                    }
                )
            }
        );
    };

    // add a recipe
    app.post("/recipe", function (req, res) {
        if (req.auth) {
            if (req.body.recipeName && req.body.categoryId && req.body.description && req.body.instruction
                && req.body.imgUrl && req.body.numServings && req.body.ingredients) {
                var recipeData = {};
                recipeData["recipeName"] = req.body.recipeName;
                recipeData["categoryId"] = req.body.categoryId;
                recipeData["description"] = req.body.description;
                recipeData["instruction"] = req.body.instruction;
                recipeData["imgUrl"] = req.body.imgUrl;
                recipeData["numServings"] = req.body.numServings;
                if (req.body.notes) {
                    recipeData["notes"] = req.body.notes;
                }

                recipeData["personId"] = req.userID;
                recipeData["ModifiedById"] = req.userID;

                var recipe = new Recipe(recipeData);

                recipe.save(function (err, newRecipe) {
                    if (err) {
                        return console.error(err);
                    }

                    // link with ingredients
                    var ingredientData = [];
                    var valid = true;
                    if (!isDefined(req.body.ingredients.length)) {
                        valid = false;
                    }
                    for (var i=0; i<req.body.ingredients.length; i++) {
                        var data = {};
                        if (isDefined(req.body.ingredients[i].id) && req.body.ingredients[i].amount) {
                            data["ingredientId"] = req.body.ingredients[i].id;
                            data["recipeId"] = newRecipe._id;
                            data["amount"] = req.body.ingredients[i].amount;
                            ingredientData.push(data);
                        } else {
                            valid = false;
                            break;
                        }
                    }
                    
                    if (valid) {
                        IngredientToRecipe.create(ingredientData, function (err) {
                            if (err) {
                                return console.error(err);
                            }

                            getRecipeDetail(req, res, newRecipe._id);
                        });
                    } else {
                        Recipe.remove({_id: newRecipe._id}, function (err) {
                            return res.status(400).json({
                                status: 400,
                                message: "CREATE RECIPE FAILURE: Bad Request (wrong ingredients format)"
                            });
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    message: "CREATE RECIPE FAILURE: Bad Request (missing required fields)"
                });
            }
        } else {
            return res.status(401).json({
                status: 401,
                message: "CREATE RECIPE FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });

    // delete a recipe
    app.delete("/recipe/:recipeId", function (req, res) {
        if (req.auth) {
            // find the recipe to be deleted
            Recipe.findOne({_id: parseInt(req.params.recipeId), isDeleted: false}, function (err, resultRecipe) {
                if (err)
                    return console.error(err);
                if (resultRecipe) {
                    // check if current user if the owner of the recipe; if not, no permission to delete
                    // Admin can delete andy recipe
                    if (req.isAdmin || req.userID == resultRecipe.personId) {
                        resultRecipe.update({isDeleted: true}, function (err) {
                            if (err)
                                return console.error(err);
                            ActionType.findOne({typeName: "delete"}, function (err, type) {
                                if (err)
                                    return console.error(err);

                                var notification = new ActionHistory({
                                    recipeOwnerId: resultRecipe.personId,
                                    operatorId: req.userID,
                                    recipeId: parseInt(req.params.recipeId),
                                    typeNumber: type._id
                                });
                                notification.save(function (err) {
                                    if (err)
                                        return console.error(err);
                                    return res.status(200).json({});
                                });
                            });
                        });
                    } else {
                        return res.status(403).json({
                            status: 403,
                            message: "DELETE RECIPE FAILURE: Forbidden (only Admin or recipe owner can delete this recipe)"
                        });
                    }
                } else {
                    return res.status(404).json({
                        status: 404,
                        message: "DELETE RECIPE FAILURE: Not Found (recipe to delete not found)"
                    });
                }
            });
        } else {
            return res.status(401).json({
                status: 401,
                message: "DELETE RECIPE FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });

    app.put("/recipe/:recipeId", function (req, res) {
        if (req.auth) {
            var toUpdate = {};
            if (req.body.recipeName) {
                toUpdate["recipeName"] = req.body.recipeName;
            }
            if (req.body.categoryId) {
                toUpdate["categoryId"] = req.body.categoryId;
            }
            if (req.body.description) {
                toUpdate["description"] = req.body.description;
            }
            if (req.body.instruction) {
                toUpdate["instruction"] = req.body.instruction;
            }
            if (req.body.imgUrl) {
                toUpdate["imgUrl"] = req.body.imgUrl;
            }
            if (req.body.numServings) {
                toUpdate["numServings"] = req.body.numServings;
            }
            if (req.body.notes) {
                toUpdate["notes"] = req.body.notes;
            }
            if (Object.keys(toUpdate).length < 1 && !req.body.ingredients) {
                return res.status(400).json({
                    status: 400,
                    message: "UPDATE RECIPE FAILURE: Bad Request (no modifiable field passed)"
                });
            } else {
                toUpdate["ModifiedById"] = req.userID;
                toUpdate["ModifiedDate"] = Date.now();
                Recipe.findOneAndUpdate({'_id': parseInt(req.params.recipeId), isDeleted: false},  toUpdate, {new : true}, function (err, updatedRecipe) {
                    if (err) {
                        return console.error(err);
                    }
                    if (updatedRecipe) {
                        if (req.body.ingredients) {
                            var ingredientData = [];
                            var valid = true;
                            if (!isDefined(req.body.ingredients.length)) {
                                valid = false;
                            }
                            for (var i=0; i<req.body.ingredients.length; i++) {
                                var data = {};
                                if (isDefined(req.body.ingredients[i].id) && req.body.ingredients[i].amount) {
                                    data["ingredientId"] = req.body.ingredients[i].id;
                                    data["recipeId"] = parseInt(req.params.recipeId);
                                    data["amount"] = req.body.ingredients[i].amount;
                                    ingredientData.push(data);
                                } else {
                                    valid = false;
                                    break;
                                }
                            }
                            
                            if (valid) {
                                IngredientToRecipe.remove({recipeId: parseInt(req.params.recipeId)}, function (err) {
                                    IngredientToRecipe.create(ingredientData, function (err, created) {
                                        if (err) {
                                            return console.error(err);
                                        }
                                        ActionType.findOne({typeName: "update"}, function (err, type) {
                                            if (err)
                                                return console.error(err);

                                            var notification = new ActionHistory({
                                                recipeOwnerId: updatedRecipe.personId,
                                                operatorId: req.userID,
                                                recipeId: parseInt(req.params.recipeId),
                                                typeNumber: type._id
                                            });
                                            notification.save(function (err) {
                                                if (err)
                                                    return console.error(err);
                                                getRecipeDetail(req, res, parseInt(req.params.recipeId));
                                            });
                                        });
                                    });
                                });
                            } else {
                                return res.status(400).json({
                                    status: 400,
                                    message: "UPDATE RECIPE FAILURE: Bad Request (recipe updated but ingredient is wrong format)"
                                });
                            }
                        } else {
                            ActionType.findOne({typeName: "update"}, function (err, type) {
                                if (err)
                                    return console.error(err);

                                var notification = new ActionHistory({
                                    recipeOwnerId: updatedRecipe.personId,
                                    operatorId: req.userID,
                                    recipeId: parseInt(req.params.recipeId),
                                    typeNumber: type._id
                                });
                                notification.save(function (err) {
                                    if (err)
                                        return console.error(err);
                                    getRecipeDetail(req, res, parseInt(req.params.recipeId));
                                });
                            });
                        }
                    } else {
                        return res.status(404).json({
                            status: 404,
                            message: "UPDATE RECIPE FAILURE: Bad Request (recipe to update not found)"
                        });
                    }
                });
            }
        } else {
            return res.status(401).json({
                status: 401,
                message: "UPDATE RECIPE FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });

    app.get("/recipe/:recipeId", function (req, res) {
        getRecipeDetail(req, res, parseInt(req.params.recipeId));
    });

};
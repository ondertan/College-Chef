module.exports = function (app, isDefined, Comment, Rate, Favorite, Recipe, ActionType, ActionHistory, User) {

    var getCommentsHelper = function (res, req, isImage, returnFields) {
        Comment.aggregate([
            {"$match": {"$and": [{"recipeId": {"$eq": parseInt(req.params.recipeId)}}, {"isImage": {"$eq": isImage}}]}},
            {"$sort": {"createdDate": -1}},
            {"$lookup": {
                    from: "users",
                    localField: "personId",
                    foreignField: "_id",
                    as: "user"
                }},
            {$unwind: "$user"},
            // set return fields
            {"$project": returnFields}
        ], function (err, comments) {
            if(err) return console.error(err);
            return res.json(comments);
        });
    };
    
    // Get all text comments of a recipe
    app.get("/recipe/:recipeId/comments/text", function (req, res) {
        var returnFields = {
                    "_id": 0,
                    "userName": "$user.userName",
                    "profilePhoto": "$user.profilePhoto",
                    "message": 1,
                    "createdDate": 1
                };
        getCommentsHelper(res, req, false, returnFields);
    });
    
    // Get all image comments of a recipe
    app.get("/recipe/:recipeId/comments/image", function (req, res) {
        var returnFields = {
                    "_id": 0,
                    "userName": "$user.userName",
                    "message": 1,
                    "createdDate": 1
                };
        getCommentsHelper(res, req, true, returnFields);
    });

    // Comment a recipe
    app.post("/recipe/:recipeId/comments", function (req, res) {
        if (req.auth)
        {
            if (isDefined(req.body.isImage) && req.body.message)
            {
                Recipe.findOne({_id: parseInt(req.params.recipeId)}, function (err, foundRecipe) {
                    if (err)
                        return console.error(err);
                    if (foundRecipe) {
                        var comment = new Comment({
                            recipeId: parseInt(req.params.recipeId),
                            personId: req.userID,
                            isImage: req.body.isImage,
                            message: req.body.message
                        });
                        comment.save(function (err) {
                            if (err)
                                return console.error(err);
                            comment.addCommentNotification(foundRecipe.personId, req.userID, parseInt(req.params.recipeId));
                            return res.status(200).json({});
                        });
                    } else {
                        return res.status(404).json({
                            status: 404,
                            message: "COMMENT RECIPE FAILURE: Not Found (recipe to comment not found)"
                        });
                    }
                });
            } else
            {
                return res.status(400).json({
                    status: 400,
                    message: "COMMENT RECIPE FAILURE: Bad Request (isImage or message not passed)"
                });
            }
        } else
        {
            return res.status(401).json({
                status: 401,
                message: "COMMENT RECIPE FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });

    // get the rate of a recipe
    app.get("/recipe/:recipeId/rate", function (req, res) {
        if (req.auth)
        {
            Rate.findOne({recipeId: parseInt(req.params.recipeId), personId: req.userID},
                    function (err, foundRate) {
                        if (err) {
                            return console.error(err);
                        }
                        if (foundRate)
                        {
                            return res.json({scores: foundRate.scores});
                        } else
                        {
                            return res.json({scores: 0});
                        }
                    });
        } else {
            return res.status(401).json({
                status: 401,
                message: "GET USER RATE FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });

    // get average rate of a specific recipe
    app.get("/recipe/:recipeId/ratings", function (req, res) {
        Rate.aggregate(
            [
                // find records of required recipe
                {"$match": {"recipeId": {"$eq": parseInt(req.params.recipeId)}}},
                // group by recipe id and calculate average scores
                {"$group": {
                    "_id": "$recipeId",
                    "avgScore": {"$avg": "$scores"}
                }}
            ], function (err, rateAvg) {
                if (rateAvg.length)
                {
                    return res.json({"avgScore": rateAvg[0].avgScore});

                } else {
                    return res.json({"avgScore": 0});
                }
            }
        );
    });

    // get list of ratings of a specific recipe except current user's rating
    app.get("/recipe/:recipeId/ratinglist", function (req, res) {
        // find records of required recipe
        var filter = [
            {"$match": {"recipeId": {"$eq": parseInt(req.params.recipeId)}}}
        ];
        if (req.auth) {
            // exclude current user's rating
            filter.push(
                {"$match": {"personId": {"$not": {"$eq": req.userID}}}}
            );
        }
        // find username of each rating
        filter.push(
            {"$lookup": {
                from: "users",
                localField: "personId",
                foreignField: "_id",
                as: "user"
            }}
        );
        filter.push({$unwind: "$user"});
        // set return fields
        filter.push(
            {"$project": {
                "_id": 0,
                "scores": 1,
                "userName": "$user.userName"
            }}
        );
        Rate.aggregate(filter, function (err, ratings) {
                return res.json(ratings);
            }
        );
    });

    // rate a recipe
    app.post("/recipe/:recipeId/rate", function (req, res) {
        if (req.auth)
        {
            if (req.body.scores)
            {
                Rate.findOne({recipeId: parseInt(req.params.recipeId), personId: req.userID}, function (err, foundRate) {
                    if (err)
                        return console.error(err);
                    if (foundRate) {
                        // update rate
                        foundRate.update({scores: req.body.scores}, function (err) {
                            if (err)
                                return console.error(err);
                            return res.status(200).json({});
                        });
                    } else {
                        // create new rate
                        var rate = new Rate({
                            recipeId: parseInt(req.params.recipeId),
                            personId: req.userID,
                            scores: req.body.scores
                        });
                        rate.save(function (err) {
                            if (err)
                                return console.error(err);
                            Recipe.findOne({_id: parseInt(req.params.recipeId)}, function (err, resRecipe) {
                                if (err)
                                    return console.error(err);
                                if (resRecipe) {
                                    rate.addRateNotification(resRecipe.personId, req.userID, parseInt(req.params.recipeId));
                                    return res.status(200).json({});
                                } else {
                                    return res.status(404).json({
                                        status: 404,
                                        message: "RATE RECIPE FAILURE: Not Found (recipe to rate not found)"
                                    });
                                }
                            });
                        });
                    }
                });
            } else
            {
                return res.status(400).json({
                    status: 400,
                    message: "RATE RECIPE FAILURE: Bad Request (scores not passed)"
                });
            }
        } else
        {
            return res.status(401).json({
                status: 401,
                message: "RATE RECIPE FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });

    // favorite a recipe
    app.post("/recipe/:recipeId/favorite", function (req, res) {
        if (req.auth)
        {
            Favorite.findOne({recipeId: parseInt((req.params.recipeId)), personId: req.userID}, function (err, result) {
                if (err)
                    return console.error(err);
                if (result) {
                    return res.status(403).json({
                        status: 403,
                        message: "FAVORITE RECIPE FAILURE: Forbidden (recipe already favorited by current user)"
                    });
                } else {
                    var favorite = new Favorite({
                        recipeId: parseInt(req.params.recipeId),
                        personId: req.userID
                    });
                    favorite.save(function (err) {
                        if (err)
                            return console.error(err);
                        Recipe.findOne({_id: favorite.recipeId}, function (err, resultRecipe) {
                            if (err)
                                return console.error(err);
                            if (resultRecipe) {
                                favorite.addFavoriteNotification(resultRecipe.personId, favorite.personId, favorite.recipeId);
                                return res.status(200).json({});
                            } else {
                                return res.status(404).json({
                                    status: 404,
                                    message: "FAVORITE RECIPE FAILURE: Not Found (recipe to favorite not found)"
                                });
                            }
                        });
                    });
                }
            });
        } else
        {
            return res.status(401).json({
                status: 401,
                message: "FAVORITE RECIPE FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });

    var addUnfavoriteNotification = function (recipeOwnerId, operatorId, recipeId) {
        ActionType.findOne({typeName: "unfavorite"}, function (err, type) {
            if (err)
                return console.error(err);

            var notification = new ActionHistory({
                recipeOwnerId: recipeOwnerId,
                operatorId: operatorId,
                recipeId: recipeId,
                typeNumber: type._id
            });
            notification.save(function (err) {
                if (err)
                    return console.error(err);
            });
        });
    };

    // unfavorite recipe
    app.delete("/recipe/:recipeId/favorite", function (req, res) {
        if (req.auth)
        {
            Favorite.findOne({recipeId: parseInt(req.params.recipeId), personId: req.userID}, function (err, foundRecord) {
                if (err)
                    return console.error(err);
                if (foundRecord) {
                    foundRecord.remove(function (err) {
                        if (err)
                            return console.error(err);
                        Recipe.findOne({_id: parseInt(req.params.recipeId)}, function (err, resultRecipe) {
                            if (err)
                                return console.error(err);
                            if (resultRecipe) {
                                addUnfavoriteNotification(resultRecipe.personId, req.userID, parseInt(req.params.recipeId));
                                return res.status(200).json({});
                            } else {
                                return res.status(404).json({
                                    status: 404,
                                    message: "UNFAVORITE RECIPE FAILURE: Not Found (recipe to unfavorite not found)"
                                });
                            }
                        });
                    });
                } else {
                    return res.status(403).json({
                        status: 403,
                        message: "UNFAVORITE RECIPE FAILURE: Forbidden (recipe is not favorited by current user)"
                    });
                }
            });
        } else
        {
            return res.status(401).json({
                status: 401,
                message: "UNFAVORITE RECIPE FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });

    // get favorite
    app.get("/recipe/:recipeId/favorite", function (req, res) {
        if (req.auth)
        {
            Favorite.findOne({recipeId: parseInt(req.params.recipeId), personId: req.userID}, function (err, foundRecord) {
                if (err)
                    return console.error(err);
                if (foundRecord) {
                    return res.json({"isFavorited": true});
                } else {
                    return res.json({"isFavorited": false});
                }
            });
        } else
        {
            return res.status(401).json({
                status: 401,
                message: "GHECK FAVORITE FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });
};



module.exports = function (app, isDefined, ActionType, ActionHistory, Favorite) {

    // get notification history
    app.get("/notification", function (req, res) {
        if (req.auth)
        {
            // check if input query are valid
            var validQueryKeys = {
                "recipetype": ["uploaded", "favorite"],
                "actiontype": ["rate", "comment", "favorite", "update", "delete"]
            };
            for (var key in req.query) {
                if (Object.keys(validQueryKeys).indexOf(key) >= 0) {
                    var valueValid = true;
                    var queryValue = "";
                    if (key === "recipetype") {
                        queryValue = req.query.recipetype;
                        if (validQueryKeys["recipetype"].indexOf(queryValue) < 0) {
                            valueValid = false;
                        }
                    } else if (key === "actiontype") {
                        queryValue = req.query.actiontype;
                        queryValue.forEach(function(act){
                            if (validQueryKeys["actiontype"].indexOf(act) < 0) {
                                valueValid = false;
                            }
                        });
                    }
                    if (!valueValid) {
                        return res.status(400).json({
                            error: 400,
                            message: "GET NOTIFICATION FAILURE: Bad Request (Invalid query key or value)"
                        });
                    }
                } else {
                    return res.status(400).json({
                        error: 400,
                        message: "GET NOTIFICATION FAILURE: Bad Request (Invalid query key or value)"
                    });
                }
            }

            // find requested action type ids
            var actionMatch = {};
            var actionTyps = req.query.actiontype;
            if (isDefined(actionTyps) && actionTyps.length > 0) {
                var matchedTypes = [];
                actionTyps.forEach(function(actionType){
                    if(actionType == "favorite"){
                        matchedTypes.push({"typeName": {"$eq": "unfavorite"}});
                    }
                    matchedTypes.push({"typeName": {"$eq": actionType}});
                });
                
                actionMatch = {"$or": matchedTypes};
            }
            
            ActionType.find(actionMatch, function (err, types) {
                var actionTypeIds = [];
                for (var i=0; i<types.length; i++) {
                    actionTypeIds.push(types[i]._id);
                }
                // find favorite recipe ids
                Favorite.aggregate(
                    [
                        // find favorite records of current user
                        {"$match": {"personId": {"$eq": req.userID}}},
                        // group them into one records
                        {"$group": {
                            "_id": "$personId",
                            "favoriteRecipeIds": {"$push": "$recipeId"}
                        }}
                    ], function (err, favorites) {
                        var favoriteRecipeIds = [];
                        if(favorites.length > 0){
                            favoriteRecipeIds = favorites[0].favoriteRecipeIds;   
                        }

                        // prepare filter depending on query
                        var actioinTypIdsMatch = {"$and": [{"typeNumber": {"$in": actionTypeIds}}, {"operatorId": {"$ne": req.userID}}]}
                        var filterRecipeTypeMatch = {};
                        var givenRecipeType = req.query.recipetype;
                        if (isDefined(givenRecipeType)) {
                            if (givenRecipeType === "uploaded") {
                                filterRecipeTypeMatch = {"$and": [actioinTypIdsMatch, {"recipeOwnerId": {"$eq": req.userID}}]};
                            } else if (givenRecipeType === "favorite") {
                                filterRecipeTypeMatch = {"$and": [actioinTypIdsMatch, {"recipeId": {"$in": favoriteRecipeIds}}]};
                            }
                        } else {
                            filterRecipeTypeMatch = {"$and": [actioinTypIdsMatch,
                                            {"$or": [{"recipeOwnerId": {"$eq": req.userID}},{"recipeId": {"$in": favoriteRecipeIds}}]}]};
                        }
                        ActionHistory.aggregate(
                            [
                                {"$match": filterRecipeTypeMatch},
                                {"$sort": {"actionDate": -1}},
                                {"$lookup": {
                                    from: "users",
                                    localField: "recipeOwnerId",
                                    foreignField: "_id",
                                    as: "recipeOwner"
                                }},
                                {$unwind: "$recipeOwner"},
                                {"$lookup": {
                                    from: "users",
                                    localField: "operatorId",
                                    foreignField: "_id",
                                    as: "operator"
                                }},
                                {$unwind: "$operator"},
                                {"$lookup": {
                                    from: "actiontypes",
                                    localField: "typeNumber",
                                    foreignField: "_id",
                                    as: "action"
                                }},
                                {$unwind: "$action"},
                                {"$lookup": {
                                    from: "recipes",
                                    localField: "recipeId",
                                    foreignField: "_id",
                                    as: "recipe"
                                }},
                                {$unwind: "$recipe"},
                                {"$project": {
                                    "_id": 0,
                                    "recipeOwnerId": 1,
                                    "recipeOwnerName": "$recipeOwner.userName",
                                    "operatorId": 1,
                                    "operatorName": "$operator.userName",
                                    "recipeId": 1,
                                    "recipeName": "$recipe.recipeName",
                                    "recipeIsDeleted": "$recipe.isDeleted",
                                    "actionTypeId": "$typeNumber",
                                    "actionTypeName": "$action.typeName",
                                    "actionTypeMsg": "$action.actionMsg",
                                    "actionDate": 1
                                }}
                            ], function (err, histories) {
                                return res.json(histories);
                            }
                        );
                    }
                );
            });
        } else
        {
            return res.status(401).json({
                status: 401,
                message: "GET NOTIFICATION FAILURE: Unauthorized (missing token or token expired)"
            });
        }
    });
};
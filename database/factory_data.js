module.exports = function (app, sha1, getRandomIntInclusive, User, Ingredient, Category, Recipe, Rate, Favorite, Comment, ActionType, IngredientToRecipe) {

    var userReady = false;
    var ingredientReady = false;
    var categoryReady = false;
    var actionTypeReady = false;

    // insert built-in action types
    var actionTypes = [
        {typeName: "rate", actionMsg: " is rated by "},
        {typeName: "comment", actionMsg: " is commented by "},
        {typeName: "favorite", actionMsg: " is favorited by "},
        {typeName: "unfavorite", actionMsg: " is unfavorited by "},
        {typeName: "update", actionMsg: " is updated by "},
        {typeName: "delete", actionMsg: " is deleted by "}
    ];

    ActionType.find({}, function (err, resTypes) {
        if (err)
            return console.error(err);
        if (!resTypes.length) {
            ActionType.create(actionTypes, function (err, createdTypes) {
                if (err)
                    return console.error(err);
                for (var i = 0; i < createdTypes.length; i++) {
                    createdTypes[i].introduce();
                }
                actionTypeReady = true;
                console.log("----------Factory action types CREATED----------");
            });
        } else {
            actionTypeReady = true;
            console.log("Factory action types OK");
        }
    });

    // insert built-in admin and user
    var users = [
        {userName: 'admin', password: sha1("adminadmin"), isAdmin: true},
        {userName: 'user', password: sha1("useruser"), isAdmin: false}
    ];

    User.find({}, function (err, resUsers) {
        if (err)
            return console.error(err);
        // check if factory admin and user have been created or not
        if (!resUsers.length) {
            User.create(users, function (err, createdUsers) {
                if (err)
                    return console.error(err);
                for (var i = 0; i < createdUsers.length; i++) {
                    createdUsers[i].introduce();
                }
                userReady = true;
                console.log("----------Factory admin and user CREATED----------");
            });
        } else {
            userReady = true;
            console.log("Factory admin and user OK");
        }
    });


    // insert built-in ingredients
    var ingredients = [
        {"name": "cream", "imgUrl": "/img/ingredients/cream.png"},
        {"name": "flour", "imgUrl": "/img/ingredients/flour.png"},
        {"name": "potato", "imgUrl": "/img/ingredients/potato.png"},
        {"name": "milk", "imgUrl": "/img/ingredients/milk.png"},
        {"name": "onion", "imgUrl": "/img/ingredients/onion.png"},
        {"name": "corn", "imgUrl": "/img/ingredients/corn.png"},
        {"name": "butter", "imgUrl": "/img/ingredients/butter.png"},
        {"name": "raspberry", "imgUrl": "/img/ingredients/raspberry.png"},
        {"name": "egg", "imgUrl": "/img/ingredients/egg.png"},
        {"name": "rice", "imgUrl": "/img/ingredients/rice.png"},
        {"name": "beef", "imgUrl": "/img/ingredients/beef.png"},
        {"name": "pumpkin", "imgUrl": "/img/ingredients/pumpkin.png"},
        {"name": "chicken", "imgUrl": "/img/ingredients/chicken.png"},
        {"name": "pork", "imgUrl": "/img/ingredients/pork.jpg"},
        {"name": "bacon", "imgUrl": "/img/ingredients/bacon.png"},
        {"name": "lettuce", "imgUrl": "/img/ingredients/lettuce.png"},
        {"name": "tomato", "imgUrl": "/img/ingredients/tomato.png"},
        {"name": "bread", "imgUrl": "/img/ingredients/bread.png"},
        {"name": "bean", "imgUrl": "/img/ingredients/bean.png"},
        {"name": "pasta", "imgUrl": "/img/ingredients/pasta.png"},
        {"name": "spaghetti", "imgUrl": "/img/ingredients/spaghetti.png"},
        {"name": "cheese", "imgUrl": "/img/ingredients/cheese.png"},
        {"name": "garlic", "imgUrl": "/img/ingredients/garlic.png"},
        {"name": "bagel", "imgUrl": "/img/ingredients/bagel.png"},
        {"name": "salmon", "imgUrl": "/img/ingredients/salmon.png"},
        {"name": "cod", "imgUrl": "/img/ingredients/cod.png"},
        {"name": "shrimp", "imgUrl": "/img/ingredients/shrimp.png"},
        {"name": "turkey", "imgUrl": "/img/ingredients/turkey.png"},
        {"name": "chocolate", "imgUrl": "/img/ingredients/chocolate.png"},
        {"name": "strawberry", "imgUrl": "/img/ingredients/strawberry.png"},
        {"name": "peach", "imgUrl": "/img/ingredients/peach.png"},
        {"name": "blueberry", "imgUrl": "/img/ingredients/blueberry.png"},
        {"name": "chilli", "imgUrl": "/img/ingredients/chilli.png"},
        {"name": "curry", "imgUrl": "/img/ingredients/curry.png"},
        {"name": "miso", "imgUrl": "/img/ingredients/miso.png"},
        {"name": "wine", "imgUrl": "/img/ingredients/wine.png"},
        {"name": "ginger", "imgUrl": "/img/ingredients/ginger.png"},
    ];

    Ingredient.find({}, function (err, allingredients) {
        if (err)
            return console.error(err);
        if (!allingredients.length) {
            Ingredient.create(ingredients, function (err, createdIngredients) {
                if (err)
                    return console.error(err);
                for (var i = 0; i < createdIngredients.length; i++) {
                    createdIngredients[i].check();
                }
                ingredientReady = true;
                console.log("----------Factory ingredients data CREATED----------");
            });
        } else {
            ingredientReady = true;
            console.log("Factory ingredients data OK");
        }
    });

    // insert built-in categories
    var categories = [
        {name: "Breakfast"},
        {name: "Main: Beef"},
        {name: "Main: Poultry"},
        {name: "Main: Pork"},
        {name: "Main: Seafood"},
        {name: "Main: Vegetarian"},
        {name: "Main"},
        {name: "Appetizers"},
        {name: "Desserts"},
        {name: "Soups"},
        {name: "Salads"},
        {name: "Beverages"}
    ];

    Category.find({}, function (err, allCategories) {
        if (err)
            return console.error(err);
        if (!allCategories.length) {
            Category.create(categories, function (err, createdCategories) {
                if (err)
                    return console.error(err);
                for (var i = 0; i < createdCategories.length; i++) {
                    createdCategories[i].check();
                }
                categoryReady = true;
                console.log("----------Factory categories data CREATED----------");
            });
        } else {
            categoryReady = true;
            console.log("Factory categories data OK");
        }
    });

    // insert built-in recipes
    var recipesData = [
        {
            "recipeName": "Easy Pavlova",
            "description": "This easy pavlova teams fresh fruit with the convenience of store-bought pavlova base. Just add cream and you will have a delicious dessert that disappears in minutes!",
            "img": "/img/recipes/pavlova.jpg",
            "category": "Desserts",
            "ingredient": ["cream", "flour"]
        },
        {
            "recipeName": "Potato Bake",
            "description": "With only four ingredients to turn the humble spud into something truly delicious, this potato bake recipe has to be a winner. Layers of potato, onion and creamy make this hearty side which can easily be a main meal with the addition of a crisp, green salad.",
            "img": "/img/recipes/pototabake.jpg",
            "category": "Appetizers",
            "ingredient": ["potato", "milk", "onion"]
        },
        {
            "recipeName": "Popcorn",
            "description": "This cinnamon popcorn is a delicious alternative to regular plain popcorn and is perfect for an after-school treat, special snack or a birthday party. All you need is a few easy ingredients and 15 minutes to put it together - so what are you waiting for?!",
            "img": "/img/recipes/popcorn.jpg",
            "category": "Appetizers",
            "ingredient": ["corn", "butter"]
        },
        {
            "recipeName": "Mousse",
            "description": "This 2 ingredient white chocolate mousse is easy enough even for the most basic cook. Grab some cream and white chocolate and you're good to go!",
            "img": "/img/recipes/mousse.jpg",
            "category": "Desserts",
            "ingredient": ["cream", "raspberry"]
        },
        {
            "recipeName": "Heart Shaped Eggs",
            "description": "Sometimes you've gotta go the extra mile to get your kids interested. These heart shaped boiled eggs will get your child's attention! They also make a cute Valentine's snack or after school snack idea.",
            "img": "/img/recipes/heartegg.jpg",
            "category": "Breakfast",
            "ingredient": ["egg"]
        },
        {
            "recipeName": "Fried Rice",
            "description": "Fried rice is the best dinner to whip up last minute on a weeknight. Using ingredients you can find in your pantry, you can make this a little more fancy with a couple of extra ingredients such as prawns or chicken. This simple fried rice is really nice hot or cold - and good for lunches too.",
            "img": "/img/recipes/friedrice.jpg",
            "category": "Main",
            "ingredient": ["egg", "rice"]
        },
        {
            "recipeName": "Beef Stroganoff",
            "description": "Beef stroganoff is a classic recipe that never goes out of style. Try this easy version that keeps things simple but delivers all the stroganoff flavours you know and love.",
            "img": "/img/recipes/beefstroganoff.jpg",
            "category": "Main: Beef",
            "ingredient": ["beef", "spaghetti"]
        },
        {
            "recipeName": "Pumpkin Soup",
            "description": "This pumpkin soup is a family favourite. Full of the flavour of roast pumpkin, it is perfect with a dollop of sour cream and a sprinkle of fresh chives alongside some crusty bread.",
            "img": "/img/recipes/pumpkinsoup.jpg",
            "category": "Soups",
            "ingredient": ["pumpkin"]
        },
        {
            "recipeName": "Chicken Soup",
            "description": "A bowl of steaming homemade chicken soup is good for your body and soul! This one uses lots of veggies and a whole chook for a tasty nutritious boost.",
            "img": "/img/recipes/chickensoup.jpg",
            "category": "Soups",
            "ingredient": ["chicken"]
        },
        {
            "recipeName": "Meat Loaf",
            "description": "This recipe is anything but regular old meatloaf! Everyone will love this moist version made in the slow cooker, with milk, mushrooms, and a little sage for extra flavor.",
            "img": "/img/recipes/meatloaf.jpg",
            "category": "Main: Pork",
            "ingredient": ["pork"]
        },
        {
            "recipeName": "Scrambled Eggs",
            "description": "Making scrambled eggs is fun, scrumptious, easy and will always go down a treat.",
            "img": "/img/recipes/scrambledeggs.jpg",
            "category": "Main: Poultry",
            "ingredient": ["egg"]
        },
        {
            "recipeName": "Chicken Nuggets",
            "description": "A chicken nugget is a chicken product made from chicken meat which is breaded or battered, then deep-fried or baked. Fast food restaurants typically fry their nuggets in vegetable oil.",
            "img": "/img/recipes/chickennuggets.jpeg",
            "category": "Main: Poultry",
            "ingredient": ["chicken"]
        },
        {
            "recipeName": "Steak",
            "description": "A steak is a meat generally sliced perpendicular to the muscle fibers, potentially including a bone.",
            "img": "/img/recipes/steak.jpg",
            "category": "Main: Beef",
            "ingredient": ["beef"]
        },
        {
            "recipeName": "BLT Sandwhich",
            "description": "A BLT is a type of bacon sandwich. The standard BLT is made up of four ingredients: bacon, lettuce, tomato and bread.",
            "img": "/img/recipes/bltsandwich.jpg",
            "category": "Breakfast",
            "ingredient": ["bacon","lettuce","tomato","bread"]
        }
    ];

    var createdRecipes = 0;

    var waitingInterval = setInterval(checkRecipe, 500);

    function checkRecipe() {
        if (userReady && ingredientReady && categoryReady && actionTypeReady) {
            // stop waiting
            clearInterval(waitingInterval);

            // create recipes
            Recipe.find({}, function (err, allRecipes) {
                if (err)
                    return console.error(err);
                if (!allRecipes.length) {
                    for (var i = 0; i < recipesData.length; i++) {
                        var data = recipesData[i];
                        createRecipeHelper(data);
                    }
                } else {
                    console.log("Factory recipe data OK");
                }
            });
        }
    }

    function createRecipeHelper(data) {
        Category.findOne({name: data["category"]}, function (err, category) {

            var creator = getRandomIntInclusive(0, 1);

            var defaultRecipe = new Recipe({
                personId: creator, recipeName: data["recipeName"],
                categoryId: category._id, description: data["description"],
                instruction: "Test test "+data["recipeName"]+" instruction", imgUrl: data["img"], numServings: getRandomIntInclusive(1, 4),
                ModifiedById: creator
            });

            defaultRecipe.save(function (err, newRecipe) {
                if (err)
                    return console.error(err);

                // link with ingredients
                for (var j = 0; j < data["ingredient"].length; j++) {
                    Ingredient.findOne({name: data["ingredient"][j]}, function (err, ingredient) {
                        var amount = getRandomIntInclusive(1, 10) + " portions";
                        var newRecord = new IngredientToRecipe({recipeId: newRecipe._id, ingredientId: ingredient._id, amount: amount});
                        newRecord.save(function (err) {
                            if (err)
                                return console.error(err);
                        });
                    });
                }

                if (newRecipe._id > 0)
                {
                    // let every factory user randomly rate current recipe
                    for (var u = 0; u < 2; u++) {
                        var score = getRandomIntInclusive(1, 5);
                        var rate = new Rate({
                            recipeId: newRecipe._id,
                            personId: u,
                            scores: score
                        });
                        rate.save(function (err, newRate) {
                            if (err)
                                return console.error(err);
                            newRate.addRateNotification(newRecipe.personId, newRate.personId, newRecipe._id);
                        });
                    }

                    // randomly favorite recipes
                    for (var p = 0; p < 2; p++) {
                        // for each user, randomly decide to favorite or not
                        var favoriteOrNot = getRandomIntInclusive(0, 10);
                        if (favoriteOrNot > 4) {
                            var favorite = new Favorite({
                                recipeId: newRecipe._id,
                                personId: p
                            });
                            favorite.save(function (err, newFavorite) {
                                if (err)
                                    return console.error(err);
                                newFavorite.addFavoriteNotification(newRecipe.personId, newFavorite.personId, newRecipe._id);
                            });
                        }
                    }

                    // randomly comment a recipe
                    var isImage = getRandomIntInclusive(0, 1);
                    var message = "good good";
                    if (isImage) {
                        message = "/img/test.gif";
                    }
                    var comment = new Comment({
                        recipeId: newRecipe._id,
                        personId: getRandomIntInclusive(0, 1),
                        isImage: isImage,
                        message: message
                    });
                    comment.save(function (err, newComment) {
                        if (err)
                            return console.error(err);
                        newComment.addCommentNotification(newRecipe.personId, newComment.personId, newRecipe._id);
                    });
                }
                else
                {
                    // rate current recipe
                    var rate = new Rate({
                        recipeId: newRecipe._id,
                        personId: 1,
                        scores: 1
                    });
                    rate.save(function (err, newRate) {
                        if (err)
                            return console.error(err);
                        newRate.addRateNotification(newRecipe.personId, newRate.personId, newRecipe._id);
                    });

                    // favorite current recipe
                    var favorite = new Favorite({
                        recipeId: newRecipe._id,
                        personId: 1
                    });
                    favorite.save(function (err, newFavorite) {
                        if (err)
                            return console.error(err);
                        newFavorite.addFavoriteNotification(newRecipe.personId, newFavorite.personId, newRecipe._id);
                    });

                    //comment current recipe
                    var comment = new Comment({
                        recipeId: newRecipe._id,
                        personId: 1,
                        isImage: false,
                        message: "test message"
                    });
                    comment.save(function (err, newComment) {
                        if (err)
                            return console.error(err);
                        newComment.addCommentNotification(newRecipe.personId, newComment.personId, newRecipe._id);
                    });
                }

                console.log("Recipe #" + newRecipe._id + " " + newRecipe.recipeName + " inserted");
                createdRecipes++;
                if (createdRecipes == recipesData.length) {
                    console.log("----------Factory recipe data CREATED----------");
                    console.log("---------------------------------------------------");
                    console.log("--------------------DATABASE OK--------------------");
                    console.log("---------------------------------------------------");
                }
            });
        });
    }
};
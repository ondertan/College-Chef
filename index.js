var express = require('express');
var app = express();

// Set views path, template engine and default layout
app.use(express.static(__dirname + '/'));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

// set this to true if want to reset database
var clearDatabase = true;

// Mongoose
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
if (process.env.PORT) {
    var connection = mongoose.createConnection("mongodb://chef:chef@ds145800.mlab.com:45800/college_chef");
} else {
    var connection = mongoose.createConnection("mongodb://localhost:27017/database");
}
connection.on('error', console.error.bind(console, 'connection error: (Do you forget to run mongod?)'));
connection.once('open', function() {
    console.log("Database ready on port 27017");

    // Mongoose auto-increment
    // Usage: https://www.npmjs.com/package/mongoose-auto-increment
    var autoIncrement = require("mongoose-auto-increment");
    autoIncrement.initialize(connection);

    var Schema = mongoose.Schema;

    // DB Models
    var ActionType = require('./database/models/action_type.js')(connection, Schema, autoIncrement);
    var ActionHistory = require('./database/models/action_history.js')(connection, Schema, autoIncrement);
    var User = require('./database/models/users.js')(connection, Schema, autoIncrement);
    var IngredientToRecipe = require('./database/models/ingredient_to_recipe.js')(connection, Schema, autoIncrement);
    var Recipe = require('./database/models/recipes.js')(connection, Schema, autoIncrement, IngredientToRecipe);
    var Category = require('./database/models/categories.js')(connection, Schema, autoIncrement);
    var Ingredient = require('./database/models/ingredients.js')(connection, Schema, autoIncrement);
    var Comment = require('./database/models/comments.js')(connection, Schema, autoIncrement, ActionHistory, Recipe, ActionType);
    var Rate = require('./database/models/rate.js')(connection, Schema, autoIncrement, ActionHistory, Recipe, ActionType);
    var Favorite = require('./database/models/favorite.js')(connection, Schema, autoIncrement, ActionHistory, Recipe, ActionType);
    var Feedback = require('./database/models/feedback.js')(connection, Schema, autoIncrement);

    // Secure Hash Algorithm 1
    var sha1 = require('sha1');

    // Reads bearer authorization token
    var bearerToken = require('express-bearer-token');
    app.use(bearerToken());

    // JSON web token
    var jwt = require('jwt-simple');
    var secret = 'QbSqjf3v1V2sMHyeo27W';

    // Function for generating token
    var generateToken = function (userID) {
        var date = new Date();
        var payload = {
            userID: userID,
            exp: date.setHours(date.getHours() + 17532)
        };
        return jwt.encode(payload, secret);
    };

    var logout = function (req, res) {
        // todo: expire token immediately
        return res.status(200).json({});
    }

    var getRandomIntInclusive = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var isDefined = function (value) {
        return typeof value !== "undefined";
    };

    // body parser to make sure every post request body is not empty
    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json({limit: '1mb'});
    app.post('*', jsonParser, function (req, res, next) {
        if (!req.body) {
            console.error("Request body not found");
            return res.sendStatus(400);
        }
        next();
    });

    // Authentication
    app.all('*', jsonParser, function (req, res, next) {
        if (req.token) {
            var decodedToken = jwt.decode(req.token, secret);
            if (decodedToken && new Date(decodedToken.exp) > new Date()) {
                User.find({_id: decodedToken.userID}, function (err, resUsers) {
                    if (err)
                        return console.error(err);
                    if (resUsers.length) {
                        req.auth = true;
                        req.userID = resUsers[0]._id;
                        req.userName = resUsers[0].userName;
                        req.isAdmin = resUsers[0].isAdmin;
                    } else {
                        // user not found, set auth failed
                        req.auth = false;
                    }
                    next();
                });
            } else {
                // token expired? set auth failed
                req.auth = false;
                next();
            }
        } else {
            // token not passed, leave auth not set
            next();
        }
    });

    if (clearDatabase) {
        connection.dropDatabase(function () {
            console.log("Database cleared");
            // factory database preparation: data required for application to run
            require('./database/factory_data.js')(app, sha1, getRandomIntInclusive, User, Ingredient, Category, Recipe, Rate, Favorite, Comment, ActionType, IngredientToRecipe);
        });
    } else {
        require('./database/factory_data.js')(app, sha1, getRandomIntInclusive, User, Ingredient, Category, Recipe, Rate, Favorite, Comment, ActionType, IngredientToRecipe);
    }

    app.get("/", function(req, res) {
        res.sendFile(path.join(__dirname + '/index.html'));
    });

    // Endpoints that manage users
    require('./apis/users_endpoints.js')(app, sha1, generateToken, isDefined, logout, User);

    // Endpoints that manage ingredients
    require('./apis/ingredients_categories_endpoints.js')(app, Recipe, Ingredient, Category);

    // Endpoints that generate specialty recipe lists
    require('./apis/specialty_recipes_endpoints.js')(app, Recipe, IngredientToRecipe, Ingredient, Rate, Favorite, Comment);

    // Endpoints that manage recipes
    require('./apis/recipes_endpoints.js')(app, isDefined, Recipe, IngredientToRecipe, Rate, ActionHistory, ActionType);

    // Endpoints that manage comments, rate and favorite
    require('./apis/recipes_evaluation_endpoints.js')(app, isDefined, Comment, Rate, Favorite, Recipe, ActionType, ActionHistory, User);

    // Endpoints that manage notifications
    require('./apis/notification_endpoints.js')(app, isDefined, ActionType, ActionHistory, Favorite);

    // Endpoints that manage sending feedback
    require('./apis/feedback_endpoints.js')(app, Feedback);

    if (process.env.PORT) {
        var server = app.listen(process.env.PORT, function () {
            console.log('App listening on port ' + process.env.PORT);
        });
    } else {
        var server = app.listen(3000, function () {
            console.log('App listening on port 3000');
        });
    }

    var shutdown = function () {
        console.log("Shutting down...");
        connection.close(function () {
            console.log('Mongoose connection closed.');
            console.log("Byebye");
            process.exit(0);
        });
    };

    // listen for TERM signal .e.g. kill
    process.on('SIGTERM', shutdown);

    // listen for INT signal e.g. Ctrl-C
    process.on('SIGINT', shutdown);
});
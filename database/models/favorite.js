module.exports = function (connection, Schema, autoIncrement, ActionHistory, Recipe, ActionType) {
    var FavoriteSchema = new Schema({
        recipeId: {type: Number, required: true, ref: 'Recipe'},
        personId: {type: Number, required: true, ref: 'User'}
    });
    
    FavoriteSchema.plugin(autoIncrement.plugin, 'Favorite');

    FavoriteSchema.methods.addFavoriteNotification = function (recipeOwnerId, operatorId, recipeId) {
        ActionType.findOne({typeName: "favorite"}, function (err, type) {
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

    return connection.model('Favorite', FavoriteSchema);
};

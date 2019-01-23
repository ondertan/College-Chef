module.exports = function (connection, Schema, autoIncrement, ActionHistory, Recipe, ActionType) {
    var RateSchema = new Schema({
        recipeId: {type: Number, required: true, ref: 'Recipe'},
        personId: {type: Number, required: true, ref: 'User'},
        scores: {type: Number, required: true, min: 1, max: 5}
    });
    
    RateSchema.plugin(autoIncrement.plugin, 'Rate');

    RateSchema.methods.addRateNotification = function (recipeOwnerId, operatorId, recipeId) {
        ActionType.findOne({typeName: "rate"}, function (err, type) {
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

    return connection.model('Rate', RateSchema);
};

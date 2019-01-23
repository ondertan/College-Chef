module.exports = function (connection, Schema, autoIncrement) {
    var ActionHistorySchema = new Schema({
        operatorId: {type: Number, required: true, ref: 'User'},
        recipeOwnerId: {type: Number, required: true, ref: 'User'},
        recipeId: {type: Number, required: true, ref: 'Recipe'},
        // 0: uploaded recipe be rated; 1: uploaded recipe be commented
        // 2: uploaded recipe be favorited; 3: uploaded recipe be deleted
        // 4: favorite recipe be modified; 5: favorite recipe be deleted
        typeNumber: {type: Number, required: true, ref: 'action_type'},
        actionDate: {type: Date, default: Date.now}
    });

    ActionHistorySchema.plugin(autoIncrement.plugin, 'ActionHistory');

    return connection.model('ActionHistory', ActionHistorySchema);
};

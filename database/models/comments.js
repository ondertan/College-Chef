module.exports = function (connection, Schema, autoIncrement, ActionHistory, Recipe, ActionType) {
    var CommentSchema = new Schema({
        recipeId: {type: Number, required: true, ref: 'Recipe'},
        personId: {type: Number, required: true, ref: 'User'},
        isImage: {type: Boolean, required: true},
        message: {type: String, required: true},
        createdDate: {type: Date, default: Date.now}
    });

    CommentSchema.plugin(autoIncrement.plugin, 'Comment');

    CommentSchema.methods.addCommentNotification = function (recipeOwnerId, operatorId, recipeId) {
        ActionType.findOne({typeName: "comment"}, function (err, type) {
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

    return connection.model('Comment', CommentSchema);
};

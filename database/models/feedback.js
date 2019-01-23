module.exports = function (connection, Schema, autoIncrement) {
    var FeedbackSchema = new Schema({
        feedback: {type: String, required: true},
        name: String,
        email: String
    });

    FeedbackSchema.plugin(autoIncrement.plugin, 'Feedback');

    return connection.model('Feedback', FeedbackSchema);
};

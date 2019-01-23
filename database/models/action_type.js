module.exports = function (connection, Schema, autoIncrement) {
    var ActionTypeSchema = new Schema({
        typeName: {type: String, required: true},
        actionMsg: {type: String, required: true}
    });

    ActionTypeSchema.plugin(autoIncrement.plugin, 'ActionType');

    ActionTypeSchema.methods.introduce = function () {
        var greeting = "Action Type " + this._id + ": " + this.typeName + " created.";
        console.log(greeting);
    };

    return connection.model('ActionType', ActionTypeSchema);
};

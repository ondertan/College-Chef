module.exports = function (connection, Schema, autoIncrement) {
    var CategorySchema = new Schema({
        name: {type: String, required: true, unique: true}
    });

    CategorySchema.plugin(autoIncrement.plugin, 'Category');

    CategorySchema.methods.check = function () {
        var greeting = "Category #" + this._id + " " + this.name;
        console.log(greeting);
    };
    
    return connection.model('Category', CategorySchema);
};

module.exports = function (connection, Schema, autoIncrement, IngredientToRecipe) {
    var RecipeSchema = new Schema({
        _id: {type: Number, ref: 'IngredientToRecipe'},
        personId: {type: Number, required: true, ref: 'User'},
        recipeName: {type: String, required: true},
        ModifiedDate: {type: Date, default: Date.now},
        ModifiedById: {type: Number, required: true, ref: 'User'},
        categoryId: {type: Number, required: true, ref: 'Category'},
        description: {type: String, required: true},
        instruction: {type: String, required: true},
        imgUrl: {type: String, required: true},
        numServings: {type: Number, required: true, min: 1},
        notes: String,
        isDeleted: {type: Boolean, default: false}
    });

    RecipeSchema.plugin(autoIncrement.plugin, 'Recipe');

    return connection.model('Recipe', RecipeSchema);
};

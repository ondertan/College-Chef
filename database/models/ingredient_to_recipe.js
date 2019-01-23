module.exports = function (connection, Schema, autoIncrement) {
    var IngredientToRecipeSchema = new Schema({
        recipeId: {type: Number, required: true, ref: 'Recipe'},
        ingredientId: {type: Number, required: true, ref: 'Ingredient'},
        amount: {type: String, required: true}
    });
    
    IngredientToRecipeSchema.plugin(autoIncrement.plugin, 'IngredientToRecipe');

    return connection.model('IngredientToRecipe', IngredientToRecipeSchema);
};

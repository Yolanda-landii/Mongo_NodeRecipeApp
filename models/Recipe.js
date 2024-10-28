const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: { type: [String], default: [] },
  instructions: { type: String, required: true },
  servings: { type: Number, required: true, min: 1 },
  cookingTime: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  prepTime: { type: Number, default: 0 },
  cookTime: { type: Number, default: 0 },
  image: { type: String, default: '' } 
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);

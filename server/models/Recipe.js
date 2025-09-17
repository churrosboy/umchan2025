import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const commentSchema = new mongoose.Schema({
  writer: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const stepSchema = new mongoose.Schema({
  step_num: { type: Number, required: true },
  text: { type: String, required: true },
  img: { type: String, default: '' }
});

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: String, required: true }
});

const recipeSchema = new mongoose.Schema({
  recipe_id: { type: String, unique: true },
  user_id: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String },
  thumbnail: { type: String, default: '' },
  ingredients: [ingredientSchema],
  steps: [stepSchema],
  pics: [String],
  view_cnt: { type: Number, default: 0 },
  like_cnt: { type: Number, default: 0 },
  comment_cnt: { type: Number, default: 0 },
  comments: [commentSchema],
  created_at: { type: Date, default: Date.now }
});

// recipe_id 자동 생성
recipeSchema.pre('save', function(next) {
  if (!this.recipe_id) {
    this.recipe_id = 'recipe_' + uuidv4();
  }
  next();
});

export default mongoose.model("RecipeDev", recipeSchema);
import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  seller_id: { type: String, required: true },
  writer_id: { type: String, required: true },
  item_id:   { type: String, default: '' },
  rating:    { type: Number, min: 1, max: 5, required: true },
  content:   { type: String, default: '' },
  image_url: { type: [String], default: [] },
  timestamp: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', ReviewSchema);
export default Review;

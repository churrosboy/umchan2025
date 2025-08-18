import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  name: String,
  address: String,
  lat: Number,
  lng: Number,
  sellingType: String,
  rating: Number,
  reviews: Number,
  hearts: Number,
  intro: String,
  images: [String],
});

const Seller = mongoose.model('Seller', sellerSchema);
export default Seller;
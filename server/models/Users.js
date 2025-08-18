import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nickname: { type: String, required: true },
  is_auth: { type: Boolean, default: false },
  item_num: { type: Number, default: 0 },
  recipe_num: { type: Number, default: 0 },
  review_num: { type: Number, default: 0 },
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], default: [0, 0] } // [경도, 위도]
  },
  avg_rating: { type: Number, default: 0 },
  review_cnt: { type: Number, default: 0 },
  like_cnt: { type: Number, default: 0 },
  instant_cnt: { type: Number, default: 0 },
  reserve_cnt: { type: Number, default: 0 },
  profile_img: { type: String },
  main_img: { type: [String], default: [null] },
  phone_num: { type: String },
  disc: { type: String },
});

const User = mongoose.model("UserDev", userSchema);
export default User;
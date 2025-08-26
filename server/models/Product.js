import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  item_id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, ref: 'users', localField: 'user_id', foreignField: 'id' },
  name: { type: String, required: true },
  type: { type: String, enum: ['즉시', '예약'], required: true },
  images: [{ type: String }], // 이미지 URL 리스트
  reserve_end: { type: String, default: '0' }, // 예약 마감 시간
  info: { type: String, required: true },
  price: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const Product = mongoose.model('ProductDev', ProductSchema);

export default Product;

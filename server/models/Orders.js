import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true },
  buyer_id: { type: String, required: true, ref: 'users', localField: 'buyer_id', foreignField: 'id' },
  seller_id: { type: String, required: true, ref: 'users', localField: 'seller_id', foreignField: 'id' },
  item_id: { type: String, required: true, ref: 'products', localField: 'item_id', foreignField: 'item_id', index: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  location: { type: String, required: true }, // 거래 장소
  created_at: { type: Date, default: Date.now } // 주문 시각
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;

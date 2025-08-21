// models/Sellers.js
import mongoose from 'mongoose';

// 💡 실제 DB 데이터 구조와 100% 동일하게 수정한 스키마입니다.
const sellerSchema = new mongoose.Schema({
  nickname: String,
  address: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [경도, 위도]
      required: true
    }
  },
  avg_rating: Number,
  review_cnt: Number,
  like_cnt: Number,
  thumbnail_list: [String],
  intro: String,
  // sellingType 필드가 DB에 없다면 이 줄은 제거해도 됩니다.
  sellingType: String, 
});

// 'Seller' 모델이 실제로는 'users' 컬렉션을 사용하도록 설정
const Seller = mongoose.model('Seller', sellerSchema, 'users');

export default Seller;
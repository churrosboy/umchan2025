// routes/user.js
import express from 'express';
import { users } from '../models/user_model.js'; // ✅ 모델 import
import { Int32, Double } from 'mongodb';

const router = express.Router();

// 📌 사용자 등록 API
router.post('/', async (req, res) => {
  try {
    const {
      uid,
      nickname,
      phone_number,
      address,
      longitude,
      latitude
    } = req.body;

    // 유효성 체크
    if (!uid || !phone_number || !address || !longitude || !latitude) {
      return res.status(400).json({ message: "필수 입력값 누락" });
    }

    const userDoc = {
      id: String(uid),
      nickname: typeof nickname === 'string' ? nickname : '',
      phone_number: String(phone_number),
      address: String(address),
      location: {
        type: "Point",
        coordinates: [ new Double(longitude), new Double(latitude) ]   // ✅ double
      },
      is_auth: false,                   // is_auth는 bool 허용
      item_num: new Int32(0),          // ✅ int
      recipe_num: new Int32(0),        // ✅ int
      review_num: new Int32(0),        // ✅ int
      avg_rating: new Double(0.0),     // ✅ double
      review_cnt: new Int32(0),        // ✅ int
      like_cnt: new Int32(0),          // ✅ int
      thumbnail_list: [],
      instant_cnt: new Int32(0),       // ✅ int
      reserve_cnt: new Int32(0),       // ✅ int
      profile_image: "",
      intro: ""
    };

    await users.insertOne(userDoc);
    res.status(201).json({ message: "사용자 등록 성공", user: userDoc });
  } catch (err) {
    console.error("❌ 사용자 등록 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

export default router;
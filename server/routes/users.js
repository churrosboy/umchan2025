// routes/user.js
import express from 'express';
import { users } from '../models/user_model.js'; // ✅ 모델 import

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
    if (!uid || !nickname || !phone_number || !address || !longitude || !latitude) {
      return res.status(400).json({ message: "필수 입력값 누락" });
    }

    const userDoc = {
      id: String(uid),                       // 🔒 string 강제
      nickname: String(nickname),           // 🔒 string 강제
      phone_number: String(phone_number),   // 🔒 string 강제
      address: String(address),             // 🔒 string 강제
      location: {
        type: "Point",                      // 🔒 정확한 문자열 (대소문자 구분됨)
        coordinates: [
          parseFloat(longitude),            // 📍 double
          parseFloat(latitude)              // 📍 double
        ]
      },
      is_auth: true,
      item_num: 0,
      recipe_num: 0,
      review_num: 0,
      avg_rating: 0.0,
      review_cnt: 0,
      like_cnt: 0,
      thumbnail_list: [],
      instant_cnt: 0,
      reserve_cnt: 0,
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
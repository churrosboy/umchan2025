import express from "express";
import { getUserById, searchUsersByProduct } from "../controllers/userContoroller.js";
import { Int32, Double } from 'mongodb';
import { users } from '../models/user_model.js'; 


const router = express.Router();

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
        coordinates: [ new Double(longitude), new Double(latitude) ]
      },
      is_auth: false,
      item_num: new Int32(0),
      recipe_num: new Int32(0),
      review_num: new Int32(0),
      avg_rating: new Double(0.0),
      review_cnt: new Int32(0),
      like_cnt: new Int32(0),
      thumbnail_list: [],
      instant_cnt: new Int32(0),
      reserve_cnt: new Int32(0),
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

// 사용자 ID로 조회
router.get("/:id", getUserById);

// 인증된 사용자 중 검색어에 해당하는 상품을 가진 사용자 검색
router.get("/search/product", searchUsersByProduct);

export default router;
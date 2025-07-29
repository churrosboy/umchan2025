import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();

const db = client.db('umchan');
const users = db.collection('users');

router.post('/', async (req, res) => {
  try {
    const {
      uid,
      phone_number,
      address
    } = req.body;

    const userDoc = {
      id: uid,
      nickname: '',             // 초기값
      is_auth: true,
      item_num: 0,
      recipe_num: 0,
      review_num: 0,
      avg_rating: 0.0,
      review_cnt: 0,
      like_cnt: 0,
      thumbnail_list: [],       // 대표사진 리스트
      instant_cnt: 0,
      reserve_cnt: 0,
      profile_image: '',
      intro: '',
      phone_number: phone_number,
      location: address,        // validator에는 없어도 가능 (에러 안남)
      created_at: new Date()
    };

    await users.insertOne(userDoc);
    res.status(200).json({ message: 'MongoDB 저장 성공' });
  } catch (err) {
    console.error('MongoDB 저장 실패:', err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

export default router;

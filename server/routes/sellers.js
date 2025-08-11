import express from "express";
import connect from "../connect.js";

const router = express.Router();

router.get("/", async (req, res) => {
  //res.send('✅ Home sellers 라우트 정상 작동');

  try {
    const { db } = await connect();
    const users = db.collection("users");

    // 판매자들만 가져오기 (is_auth true로 필터링 가능)
    const sellers = await users.find({ is_auth: true }).toArray();

    // 필요한 필드만 가공해서 반환 (프런트에서 쓰는 구조 맞춰줌)
    const result = sellers.map((u) => ({
      id: u.id,
      name: u.nickname,
      rating: u.avg_rating,
      reviews: u.review_cnt,
      hearts: u.like_cnt,
      address: u.address,
      intro: u.intro,
      lat: u.location?.coordinates[1],
      lng: u.location?.coordinates[0],
      images: u.thumbnail_list || [],
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("판매자 목록 에러:", err);
    res.status(500).json({ error: "판매자 조회 실패" });
  }
});

export default router;

import express from "express";
import History from "../models/History.js";

const router = express.Router();

// 검색 기록 추가
router.post("/add", async (req, res) => {
  console.log("📥 검색 기록 추가 요청 수신:", req.body);
  try {
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: "검색어가 필요합니다." });
    }

    const existingHistory = await History.findOne({ keyword });

    if (existingHistory) {
      existingHistory.count += 1;
      existingHistory.lastSearchedAt = new Date();
      await existingHistory.save();
      console.log("✅ 기존 검색 기록 업데이트:", existingHistory);
    } else {
      const newHistory = await History.create({ keyword, count: 1, lastSearchedAt: new Date() });
      console.log("✅ 새 검색 기록 추가:", newHistory);
    }

    res.status(200).json({ message: "검색 기록이 추가되었습니다." });
  } catch (err) {
    console.error("❌ 검색 기록 추가 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 검색 기록 조회
router.get("/list", async (req, res) => {
  console.log("📥 검색 기록 조회 요청 수신");
  try {
    const history = await History.find().sort({ lastSearchedAt: -1 });
    console.log("✅ 검색 기록 조회 성공:", history);
    res.status(200).json(history);
  } catch (err) {
    console.error("❌ 검색 기록 조회 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 연관 검색어 조회
router.get("/suggestions", async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword || keyword.trim() === '') {
      return res.status(200).json([]);
    }

    // 검색어와 일치하는 키워드 찾기 (대소문자 구분 없이)
    const regex = new RegExp(keyword, 'i');
    const suggestions = await History.find({ keyword: regex })
      .sort({ count: -1, lastSearchedAt: -1 })
      .limit(5)
      .select('keyword count lastSearchedAt');
    
    res.status(200).json(suggestions);
  } catch (err) {
    console.error("❌ 연관 검색어 조회 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

export default router;
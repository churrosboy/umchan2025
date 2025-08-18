import History from "../models/History.js";

// 검색 기록 추가
export async function addHistory(req, res) {
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
    } else {
      await History.create({ keyword, count: 1, lastSearchedAt: new Date() });
    }

    res.status(200).json({ message: "검색 기록이 추가되었습니다." });
  } catch (err) {
    console.error("❌ 검색 기록 추가 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}

// 검색 기록 조회
export async function getHistory(req, res) {
  try {
    const history = await History.find().sort({ lastSearchedAt: -1 });
    res.status(200).json(history);
  } catch (err) {
    console.error("❌ 검색 기록 조회 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}

// server/routes/myreview.js
import express from "express";
import admin from "../firebaseAdmin.js"; // profile과 동일한 admin 인스턴스 사용

const router = express.Router();

// 공통: Bearer 토큰 파서 (profile.js와 동일 패턴)
function parseBearer(req) {
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

// 라우트 확인용 (브라우저에서 바로 확인: GET /api/myreview/ping)
router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "/api/myreview" });
});

// 더미 데이터 (스키마 고정: seller_id, rating, content, image_url[], item_id, writer_id, timestamp)
const DEMO_REVIEWS = [
  {
    seller_id: "seller_001",
    rating: 5,
    content: "양도 많고 맛 최고!",
    image_url: ["https://picsum.photos/seed/rv1/200/200"],
    item_id: "item_aaa",
    writer_id: "x2egPwUdHjPufgdQOH7FMiPhANS2",
    timestamp: "2025-08-14T10:20:00Z",
  },
  {
    seller_id: "seller_002",
    rating: 4,
    content: "만족! 재주문 의사 있어요.",
    image_url: ["https://picsum.photos/seed/rv2/200/200"],
    item_id: "item_bbb",
    writer_id: "demo-uid-123",
    timestamp: "2025-08-12T09:10:00Z",
  },
  {
    seller_id: "seller_xyz",
    rating: 3,
    content: "보통이에요.",
    image_url: [],
    item_id: "item_ccc",
    writer_id: "someone-else-999",
    timestamp: "2025-08-10T07:00:00Z",
  },
];

// GET /api/myreview : 현재 로그인 사용자의 리뷰만(일단은 더미에서 필터)
router.get("/", async (req, res) => {
  const token = parseBearer(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const { uid } = await admin.auth().verifyIdToken(token);

    const rows = DEMO_REVIEWS
      .filter((r) => r.writer_id === uid || uid === "demo-uid-123")
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(rows);
  } catch (err) {
    console.error("GET /myreview error:", err);
    // 토큰 이슈는 401로
    if (err?.code === "auth/id-token-expired" || err?.code === "auth/argument-error") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

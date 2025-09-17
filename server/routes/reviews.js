import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import mongoose from "mongoose";
import admin from "../firebaseAdmin.js";
import connect from "../connect.js";
import { uploadLocalFileToGCS } from "../utils/firebaseUpload.js";

const router = express.Router();

/* ------------------ 공통 유틸 ------------------ */
function parseBearer(req) {
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

async function getDB(req) {
  const fromLocals = req?.app?.locals?.db;
  if (fromLocals && typeof fromLocals.collection === "function") return fromLocals;
  if (mongoose.connection?.db) return mongoose.connection.db;
  await connect();
  if (mongoose.connection?.db) return mongoose.connection.db;
  throw new Error("DB not initialized");
}

/* ------------------ 업로드(multer) ------------------ */
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${base}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, // 파일당 5MB, 최대 6장
  fileFilter: (req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) {
      return cb(new Error("이미지 파일만 업로드 가능합니다."));
    }
    cb(null, true);
  },
});

/* ------------------ 인덱스 보장 ------------------ */
let indexesEnsured = false;
async function ensureIndexes(db) {
  if (indexesEnsured) return;
  try {
    await db.collection("reviews").createIndex({ review_id: 1 }, { unique: true });
    await db.collection("reviews").createIndex({ order_id: 1, writer_id: 1 }, { unique: true, sparse: true });
    await db.collection("reviews").createIndex({ seller_id: 1, timestamp: -1 });
    await db.collection("review_media").createIndex({ review_id: 1, index: 1 });
  } catch (e) {
    console.error("ensureIndexes error:", e);
  } finally {
    indexesEnsured = true;
  }
}

/* ------------------ 평점 재계산 ------------------ */
async function recalcSellerRating(db, seller_id) {
  const reviews = db.collection("reviews");
  const users = db.collection("users");

  const agg = await reviews.aggregate([
    { $match: { seller_id: String(seller_id) } },
    { $group: { _id: "$seller_id", avg: { $avg: "$rating" }, cnt: { $sum: 1 } } },
  ]).toArray();

  const { avg, cnt } = agg[0] || { avg: 0, cnt: 0 };
  await users.updateOne(
    { id: String(seller_id) },
    { $set: { avg_rating: Number(avg) || 0, review_cnt: Number(cnt) || 0, updatedAt: new Date() } }
  );
}

/* ------------------ 내 리뷰 목록 ------------------ */
router.get("/mine", async (req, res) => {
  const token = parseBearer(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const { uid } = await admin.auth().verifyIdToken(token);
    const db = await getDB(req);
    await ensureIndexes(db);

    const reviews = db.collection("reviews");
    const media = db.collection("review_media");

    const list = await reviews.find({ writer_id: uid }).sort({ timestamp: -1 }).limit(200).toArray();

    const ids = list.map((r) => r.review_id);
    const medias = await media.find({ review_id: { $in: ids } }).sort({ index: 1 }).toArray();
    const imagesByReview = medias.reduce((acc, m) => {
      (acc[m.review_id] ||= []).push(m.url);
      return acc;
    }, {});

    const combined = list.map((r) => ({ ...r, images: imagesByReview[r.review_id] || [] }));
    res.json({ reviews: combined });
  } catch (err) {
    console.error("GET /reviews/mine error:", err);
    if (err?.code === "auth/argument-error" || err?.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

/* ------------------ ⚠️ 특정 경로들을 먼저 등록 ------------------ */
/* 주문별 리뷰 존재 여부 */
router.get("/exists/:order_id", async (req, res) => {
  const token = parseBearer(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const { uid } = await admin.auth().verifyIdToken(token);
    const db = await getDB(req);
    await ensureIndexes(db);

    const { order_id } = req.params;
    const r = await db.collection("reviews").findOne(
      { order_id: String(order_id), writer_id: uid },
      { projection: { review_id: 1 } }
    );
    res.json({ exists: !!r, review_id: r?.review_id || null });
  } catch (err) {
    console.error("GET /reviews/exists/:order_id error:", err);
    res.status(500).json({ error: "Failed to check existence" });
  }
});

/* 주문별 리뷰 조회 (images 포함) */
router.get("/by-order/:order_id", async (req, res) => {
  const token = parseBearer(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const { uid } = await admin.auth().verifyIdToken(token);
    const db = await getDB(req);
    await ensureIndexes(db);

    const reviews = db.collection("reviews");
    const media = db.collection("review_media");

    const { order_id } = req.params;
    const r = await reviews.findOne({ order_id: String(order_id), writer_id: uid });
    if (!r) return res.status(404).json({ error: "Review not found" });

    const imgs = await media.find({ review_id: r.review_id }).sort({ index: 1 }).toArray();
    res.json({ review: { ...r, images: imgs.map(m => m.url) } });
  } catch (err) {
    console.error("GET /reviews/by-order/:order_id error:", err);
    res.status(500).json({ error: "Failed to load review by order" });
  }
});

/* ------------------ <-- 여기서부터 일반 경로 ------------------ */
/* 리뷰 단건 조회 */
router.get("/:review_id", async (req, res) => {
  try {
    const db = await getDB(req);
    await ensureIndexes(db);

    const reviews = db.collection("reviews");
    const media = db.collection("review_media");

    const { review_id } = req.params;
    const r = await reviews.findOne({ review_id });
    if (!r) return res.status(404).json({ error: "Review not found" });

    const imgs = await media.find({ review_id }).sort({ index: 1 }).toArray();
    res.json({ review: { ...r, images: imgs.map(m => m.url) } });
  } catch (err) {
    console.error("GET /reviews/:review_id error:", err);
    res.status(500).json({ error: "Failed to load review" });
  }
});

/* 리뷰 작성 (주문 1건당 1회) */
router.post("/", upload.array("images", 6), async (req, res) => {
  const token = parseBearer(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const { uid } = await admin.auth().verifyIdToken(token);
    const db = await getDB(req);
    await ensureIndexes(db);

    const reviews = db.collection("reviews");
    const media = db.collection("review_media");

    const { seller_id, item_id, order_id, rating, content } = req.body;
    const files = req.files || [];

    const r = Number(rating);
    if (!seller_id) return res.status(400).json({ error: "seller_id is required" });
    if (!item_id) return res.status(400).json({ error: "item_id is required" });
    if (!order_id) return res.status(400).json({ error: "order_id is required" });
    if (!(r >= 1 && r <= 5)) return res.status(400).json({ error: "rating must be 1~5" });

    const dup = await reviews.findOne({ order_id: String(order_id), writer_id: uid });
    if (dup) return res.status(409).json({ error: "Review already exists for this order", review_id: dup.review_id });

    const review_id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();

    const doc = {
      review_id,
      order_id: String(order_id),
      item_id: String(item_id),
      writer_id: uid,
      seller_id: String(seller_id),
      content: typeof content === "string" ? content : "",
      rating: r,
      timestamp: now,
    };

    await reviews.insertOne(doc);

    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        const dest = `reviews/${uid}/${review_id}/img_${i}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const url = await uploadLocalFileToGCS(f.path, dest, f.mimetype, {
          firebaseStorageDownloadTokens: `${uid}_${i}`,
        });
        urls.push(url);
        await media.insertOne({ review_id, url, index: i, created_at: now });
      } catch (e) {
        console.error("이미지 업로드 실패:", e.message);
      }
    }

    await recalcSellerRating(db, seller_id);

    res.json({ review: { ...doc, images: urls } });
  } catch (err) {
    console.error("POST /reviews error:", err);
    if (err?.code === "auth/argument-error" || err?.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Review already exists for this order" });
    }
    res.status(500).json({ error: "Failed to create review" });
  }
});

/* 리뷰 수정(텍스트/별점) */
router.patch("/:review_id", async (req, res) => {
  const token = parseBearer(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const { uid } = await admin.auth().verifyIdToken(token);
    const db = await getDB(req);
    await ensureIndexes(db);

    const reviews = db.collection("reviews");

    const { review_id } = req.params;
    const current = await reviews.findOne({ review_id });
    if (!current) return res.status(404).json({ error: "Review not found" });
    if (current.writer_id !== uid) return res.status(403).json({ error: "Forbidden" });

    const update = {};
    if (typeof req.body.content === "string") update.content = req.body.content;
    if (req.body.rating != null) {
      const r = Number(req.body.rating);
      if (!(r >= 1 && r <= 5)) return res.status(400).json({ error: "rating must be 1~5" });
      update.rating = r;
    }
    if (!Object.keys(update).length) return res.status(400).json({ error: "No changes" });

    await reviews.updateOne({ review_id }, { $set: update });
    const updated = await reviews.findOne({ review_id });

    await recalcSellerRating(db, updated.seller_id);

    res.json({ review: updated });
  } catch (err) {
    console.error("PATCH /reviews/:review_id error:", err);
    if (err?.code === "auth/argument-error" || err?.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Failed to update review" });
  }
});

/* 리뷰 이미지 교체 */
router.put("/:review_id/images", upload.array("images", 6), async (req, res) => {
  const token = parseBearer(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const { uid } = await admin.auth().verifyIdToken(token);
    const db = await getDB(req);
    await ensureIndexes(db);

    const reviews = db.collection("reviews");
    const media = db.collection("review_media");

    const { review_id } = req.params;
    const current = await reviews.findOne({ review_id });
    if (!current) return res.status(404).json({ error: "Review not found" });
    if (current.writer_id !== uid) return res.status(403).json({ error: "Forbidden" });

    const keep = []
      .concat(req.body.keep || [])
      .filter(u => typeof u === "string" && u.startsWith("http"));

    const old = await media.find({ review_id }).toArray();

    const toDelete = old.filter(m => !keep.includes(m.url));
    if (toDelete.length) {
      await media.deleteMany({ review_id, url: { $in: toDelete.map(m => m.url) } });
    }

    const files = req.files || [];
    const now = new Date();
    const newUrls = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const dest = `reviews/${uid}/${review_id}/repl_${i}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      const url = await uploadLocalFileToGCS(f.path, dest, f.mimetype, {
        firebaseStorageDownloadTokens: `${uid}_repl_${i}`,
      });
      newUrls.push(url);
      await media.insertOne({ review_id, url, index: 9999 + i, created_at: now });
    }

    const finalUrls = [...keep, ...newUrls];
    await Promise.all(finalUrls.map((u, idx) =>
      media.updateOne({ review_id, url: u }, { $set: { index: idx } })
    ));

    res.json({ images: finalUrls });
  } catch (err) {
    console.error("PUT /reviews/:review_id/images error:", err);
    if (err?.code === "auth/argument-error" || err?.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Failed to replace images" });
  }
});

// 받은 리뷰(판매자 기준) 목록
router.get("/seller/:seller_id", async (req, res) => {
  const token = parseBearer(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    await admin.auth().verifyIdToken(token); // 로그인 검증만
    const db = await getDB(req);
    await ensureIndexes(db);

    const { seller_id } = req.params;
    const reviews = db.collection("reviews");
    const media = db.collection("review_media");
    const users = db.collection("users");

    const list = await reviews
      .find({ seller_id: String(seller_id) })
      .sort({ timestamp: -1 })
      .limit(300)
      .toArray();

    // 이미지 붙이기
    const ids = list.map(r => r.review_id);
    const medias = await media.find({ review_id: { $in: ids } }).sort({ index: 1 }).toArray();
    const imgsByReview = medias.reduce((acc, m) => {
      (acc[m.review_id] ||= []).push(m.url);
      return acc;
    }, {});

    // 작성자 닉네임 붙이기
    const writerIds = [...new Set(list.map(r => r.writer_id))];
    const writers = await users.find({ id: { $in: writerIds } }).project({ id: 1, nickname: 1 }).toArray();
    const nickById = writers.reduce((acc, u) => { acc[u.id] = u.nickname || u.id; return acc; }, {});

    const out = list.map(r => ({
      ...r,
      images: imgsByReview[r.review_id] || [],
      buyer_nickname: nickById[r.writer_id] || r.writer_id,
    }));

    res.json({ reviews: out });
  } catch (err) {
    console.error("GET /reviews/seller/:seller_id error:", err);
    if (err?.code === "auth/argument-error" || err?.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Failed to load reviews for seller" });
  }
});

/* 리뷰 삭제 */
router.delete("/:review_id", async (req, res) => {
  const token = parseBearer(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const { uid } = await admin.auth().verifyIdToken(token);
    const db = await getDB(req);
    await ensureIndexes(db);

    const reviews = db.collection("reviews");
    const media = db.collection("review_media");

    const { review_id } = req.params;
    const current = await reviews.findOne({ review_id });
    if (!current) return res.status(404).json({ error: "Review not found" });
    if (current.writer_id !== uid) return res.status(403).json({ error: "Forbidden" });

    await reviews.deleteOne({ review_id });
    await media.deleteMany({ review_id });

    await recalcSellerRating(db, current.seller_id);

    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /reviews/:review_id error:", err);
    if (err?.code === "auth/argument-error" || err?.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;

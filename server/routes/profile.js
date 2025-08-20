// routes/profile.js
import express from "express";
import admin from "../firebaseAdmin.js";   // firebase-admin 초기화
import connect from "../connect.js";       // DB 연결
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// 업로드 디렉토리 준비
const uploadDir = path.resolve(process.cwd(), "uploads"); // 실행 CWD 기준 절대경로
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 저장소 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");
    cb(
      null,
      `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${base}${ext}`
    );
  },
});

const upload = multer({ storage });

// 업로드 파일을 프론트에서 접근할 URL로 변환
const fileUrl = (filename) => `/api/uploads/${filename}`;

// ✅ 프로필 조회
router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const userId = decoded.uid;

    const { db } = await connect();
    const users = db.collection("users");

    const user = await users.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
});

// ✅ 프로필 저장(텍스트 + 파일 FormData)
// 받아들일 필드:
//  - 텍스트: nickname, intro, clear_profile_image, clear_thumbnail0/1/2 (문자열 'true'/'false')
//  - 파일: profile_image(1개), thumbnail0/thumbnail1/thumbnail2 (각 1개씩)
router.patch(
  "/",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "thumbnail0", maxCount: 1 },
    { name: "thumbnail1", maxCount: 1 },
    { name: "thumbnail2", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "No token" });

      const decoded = await admin.auth().verifyIdToken(token);
      const userId = decoded.uid;

      const { db } = await connect();
      const users = db.collection("users");

      const current = await users.findOne({ id: userId });
      if (!current) return res.status(404).json({ error: "User not found" });

      const body = req.body;   // multer가 텍스트 필드를 파싱한 값
      const files = req.files || {};

      const update = { $set: {} };

      // 텍스트 필드
      if (typeof body.nickname === "string") update.$set.nickname = body.nickname;
      if (typeof body.intro === "string") update.$set.intro = body.intro;
      if (typeof body.address === "string") update.$set.address = body.address;
      if (typeof body.phone_number === "string") update.$set.phone_number = body.phone_number;

      // 프로필 이미지
      const profileFile = files.profile_image?.[0];
      if (profileFile) {
        update.$set.profile_image = fileUrl(profileFile.filename);
      } else if (String(body.clear_profile_image).toLowerCase() === "true") {
        update.$set.profile_image = null;
      }

      // 썸네일(3칸 고정) 갱신
      const curThumbs = Array.isArray(current.thumbnail_list)
        ? [...current.thumbnail_list]
        : [null, null, null];
      const newThumbs = [...curThumbs].slice(0, 3);
      while (newThumbs.length < 3) newThumbs.push(null);

      for (let i = 0; i < 3; i++) {
        const f = files[`thumbnail${i}`]?.[0];
        const clear = String(body[`clear_thumbnail${i}`]).toLowerCase() === "true";
        if (f) newThumbs[i] = fileUrl(f.filename);
        else if (clear) newThumbs[i] = null;
      }

      update.$set.thumbnail_list = newThumbs;

      await users.updateOne({ id: userId }, update);

      const updated = await users.findOne({ id: userId });
      res.json({ user: updated });
    } catch (err) {
      console.error(err);
      if (err.code === "auth/argument-error") {
        return res.status(401).json({ error: "Invalid token" });
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

// ✅ is_auth 토글 (true <-> false)
router.patch("/toggle-auth", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = await admin.auth().verifyIdToken(token);
    const userId = decoded.uid;

    const { db } = await connect();
    const users = db.collection("users");

    const current = await users.findOne({ id: userId });
    if (!current) return res.status(404).json({ error: "User not found" });

    const currentVal = Boolean(current.is_auth);
    const nextVal = !currentVal;

    await users.updateOne(
      { id: userId },
      { $set: { is_auth: nextVal, updatedAt: new Date() } }
    );

    const updated = await users.findOne({ id: userId });
    res.json({ user: updated });
  } catch (err) {
    console.error(err);
    if (err.code === "auth/argument-error") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Failed to toggle is_auth" });
  }
});

export default router;

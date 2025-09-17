import express from "express";
import admin from "../firebaseAdmin.js";
import connect from "../connect.js";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

/* ------------------ DB Helper (Mongoose 우선) ------------------ */
async function getDB(req) {
  const fromLocals = req?.app?.locals?.db;
  if (fromLocals && typeof fromLocals.collection === "function") return fromLocals;
  if (mongoose.connection?.db) return mongoose.connection.db;
  await connect();
  if (mongoose.connection?.db) return mongoose.connection.db;
  throw new Error("DB not initialized: mongoose.connection.db is not available");
}

/* ------------------ 업로드 설정 ------------------ */
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${base}${ext}`);
  },
});
const upload = multer({ storage });

function parseBearer(req) {
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

/* ------------------ 닉네임 중복 체크 (기존 기능 유지) ------------------ */
router.get("/check-nickname", async (req, res) => {
  try {
    const { nickname } = req.query;
    if (!nickname || typeof nickname !== "string") {
      return res.status(400).json({ error: "닉네임을 입력해주세요." });
    }
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      return res.status(400).json({ error: "닉네임은 2-10자 사이로 입력해주세요." });
    }
    const db = await getDB(req);
    const users = db.collection("users");
    const existingUser = await users.findOne({
      nickname: { $regex: new RegExp(`^${trimmedNickname}$`, "i") },
    });
    const available = !existingUser;
    res.json({
      available,
      message: available ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다.",
    });
  } catch (err) {
    console.error("GET /profile/check-nickname error:", err);
    res.status(500).json({ error: "닉네임 확인 중 오류가 발생했습니다." });
  }
});

/* ------------------ [신규] 프로필 이미지 업로드 API ------------------ */
router.post(
  "/upload-profile-image",
  upload.single('profileImage'), // 프론트에서 'profileImage' 이름으로 보낸 파일을 받음
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "이미지 파일이 없습니다." });
      }
      
      const { uid } = req.body;
      if(!uid) {
        return res.status(400).json({ error: "사용자 정보(uid)가 없습니다." });
      }

      const bucket = admin.storage().bucket();
      const timestamp = Date.now();
      const destination = `profile_images/${uid}_${timestamp}${path.extname(file.originalname)}`;
      
      await bucket.upload(file.path, {
        destination: destination,
        metadata: { contentType: file.mimetype },
      });
      
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
      
      fs.unlinkSync(file.path);
      
      res.status(200).json({ imageUrl });

    } catch(err) {
      console.error("POST /profile/upload-profile-image error:", err);
      res.status(500).json({ error: "이미지 업로드 중 서버 오류가 발생했습니다." });
    }
  }
);

/* ------------------ [신규] 프로필 정보 업데이트 API ------------------ */
router.put("/update-profile", async (req, res) => {
    const token = parseBearer(req);
    if (!token) {
      return res.status(401).json({ error: "인증 토큰이 필요합니다." });
    }

    try {
        const { uid: tokenUid } = await admin.auth().verifyIdToken(token);
        const { uid, nickname, introduction, profileImageUrl, isProfileComplete } = req.body;

        if (tokenUid !== uid) {
            return res.status(403).json({ error: "권한이 없습니다." });
        }

        const db = await getDB(req);
        const users = db.collection("users");
        
        const currentUser = await users.findOne({ id: uid });
        if (!currentUser) {
            return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
        }

        const updateData = { updatedAt: new Date() };

        if (nickname) {
            const trimmedNickname = nickname.trim();
            if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
                return res.status(400).json({ error: "닉네임은 2-10자 사이여야 합니다." });
            }

            if (trimmedNickname.toLowerCase() !== (currentUser.nickname || '').toLowerCase()) {
                const existingUser = await users.findOne({
                    nickname: { $regex: new RegExp(`^${trimmedNickname}$`, 'i') },
                    id: { $ne: uid }
                });

                if (existingUser) {
                    return res.status(400).json({ error: "이미 사용 중인 닉네임입니다." });
                }
            }
            updateData.nickname = trimmedNickname;
        }

        if (typeof introduction === 'string') {
            updateData.intro = introduction;
        }
        if (typeof profileImageUrl === 'string' && profileImageUrl) { // 빈 문자열이 아닐 때만 업데이트
            updateData.profile_img = profileImageUrl;
        }
        if (typeof isProfileComplete === 'boolean') {
            updateData.isProfileComplete = isProfileComplete;
        }

        await users.updateOne({ id: uid }, { $set: updateData });

        const updatedUser = await users.findOne({ id: uid });
        res.status(200).json({ success: true, user: updatedUser });

    } catch (err) {
        console.error("PUT /profile/update-profile error:", err);
        if (err?.code?.startsWith("auth/")) {
            return res.status(401).json({ error: "유효하지 않은 토큰입니다." });
        }
        res.status(500).json({ error: "프로필 업데이트 중 서버 오류가 발생했습니다." });
    }
});

/* ------------------ 기존 프로필 조회/수정 라우트 (참고용으로 남겨둠) ------------------ */
// 필요 없다면 이 부분은 삭제하셔도 좋습니다.
router.get("/", async (req, res) => {
  const token = parseBearer(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const { uid } = await admin.auth().verifyIdToken(token);
    const db = await getDB(req);
    const users = db.collection("users");
    const user = await users.findOne({ id: uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("GET /profile error:", err);
    if (err?.code === "auth/id-token-expired" || err?.code === "auth/argument-error") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Failed to load profile" });
  }
});


export default router;
// routes/profile.js
import express from "express";
import admin from "../firebaseAdmin.js";    // firebase-admin 초기화 (default export 가정)
import connect from "../connect.js";        // mongoose 연결 함수 (idempotent)
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

/* ------------------ DB Helper (Mongoose 우선) ------------------ */
async function getDB(req) {
  // 1) app.js에서 미리 넣어둔 db가 있으면 사용
  const fromLocals = req?.app?.locals?.db;
  if (fromLocals && typeof fromLocals.collection === "function") return fromLocals;

  // 2) 이미 mongoose가 연결된 경우
  if (mongoose.connection?.db) return mongoose.connection.db;

  // 3) 연결을 보장하고 다시 확인
  await connect(); // 여러 번 호출되어도 안전해야 함
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

const fileUrl = (filename) => `/api/uploads/${filename}`;

function parseBearer(req) {
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

/* ------------------ 프로필 조회 (기존 코드 유지) ------------------ */
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

/* ------------------ 프로필 수정 (텍스트 + 파일) (기존 코드 유지) ------------------ */
router.patch(
  "/",
  upload.fields([
    { name: "profile_img", maxCount: 1 },
    { name: "thumbnail0", maxCount: 1 },
    { name: "thumbnail1", maxCount: 1 },
    { name: "thumbnail2", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("Firebase Admin 상태 확인:");
      console.log("- admin.storage() 존재 여부:", !!admin.storage());
      console.log("- bucket 존재 여부:", !!admin.storage().bucket());
      try {
        const bucketName = admin.storage().bucket().name;
        console.log("- bucket 이름:", bucketName);
      } catch (e) {
        console.error("- bucket 이름 확인 실패:", e.message);
      }
      
      const token = parseBearer(req);
      if (!token) return res.status(401).json({ error: "No token" });

      const { uid } = await admin.auth().verifyIdToken(token);

      const db = await getDB(req);
      const users = db.collection("users");

      const current = await users.findOne({ id: uid });
      if (!current) return res.status(404).json({ error: "User not found" });

      const body = req.body;
      const files = req.files || {};
      const update = { $set: { updatedAt: new Date() } };

      if (typeof body.nickname === "string") update.$set.nickname = body.nickname;
      if (typeof body.intro === "string") update.$set.intro = body.intro;
      if (typeof body.address === "string") update.$set.address = body.address;
      if (typeof body.phone_number === "string") update.$set.phone_number = body.phone_number;

      const profileFile = files.profile_img?.[0];
      if (profileFile) {
        try {
          console.log("프로필 이미지 Firebase 업로드 시작:", profileFile.filename);
          
          const bucket = admin.storage().bucket();
          
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 8);
          const destination = `profile_images/${uid}_${timestamp}_${randomId}`;
          
          const filePath = profileFile.path;
          
          await bucket.upload(filePath, {
            destination: destination,
            metadata: {
              contentType: profileFile.mimetype,
              metadata: {
                firebaseStorageDownloadTokens: uid
              }
            }
          });
          
          const file = bucket.file(destination);
          const [metadata] = await file.getMetadata();
          
          const bucketName = bucket.name;
          const downloadToken = metadata.metadata.firebaseStorageDownloadTokens;
          const fileUrls = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;
          
          update.$set.profile_img = fileUrls;
          
          fs.unlinkSync(filePath);

          console.log("프로필 이미지 Firebase 업로드 성공:", fileUrls);
        } catch (error) {
          console.error("Firebase 업로드 오류:", error);
          update.$set.profile_img = fileUrl(profileFile.filename);
          console.log("로컬 URL로 대체:", update.$set.profile_img);
        }
      } else if (String(body.clear_profile_img).toLowerCase() === "true") {
        update.$set.profile_img = null;
        console.log("프로필 이미지 삭제");
      }

      const curThumbs = Array.isArray(current.thumbnail_list)
        ? [...current.thumbnail_list]
        : [null, null, null];
      const newThumbs = [...curThumbs].slice(0, 3);
      while (newThumbs.length < 3) newThumbs.push(null);

      for (let i = 0; i < 3; i++) {
        const f = files[`thumbnail${i}`]?.[0];
        const clear = String(body[`clear_thumbnail${i}`]).toLowerCase() === "true";
        
        if (f) {
          try {
            console.log(`썸네일 ${i} Firebase 업로드 시작:`, f.filename);
            
            const bucket = admin.storage().bucket();
            
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 8);
            const destination = `thumbnails/${uid}_${i}_${timestamp}_${randomId}`;
            
            const filePath = f.path;
            
            await bucket.upload(filePath, {
              destination: destination,
              metadata: {
                contentType: f.mimetype,
                metadata: {
                  firebaseStorageDownloadTokens: `${uid}_${i}`
                }
              }
            });
            
            const file = bucket.file(destination);
            const [metadata] = await file.getMetadata();
            
            const bucketName = bucket.name;
            const downloadToken = metadata.metadata.firebaseStorageDownloadTokens;
            const thumbnailUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;
            
            newThumbs[i] = thumbnailUrl;
            
            fs.unlinkSync(filePath);
            
            console.log(`썸네일 ${i} Firebase 업로드 성공:`, thumbnailUrl);
          } catch (error) {
            console.error(`썸네일 ${i} Firebase 업로드 오류:`, error);
            newThumbs[i] = fileUrl(f.filename);
            console.log(`썸네일 ${i} 로컬 URL로 대체:`, newThumbs[i]);
          }
        } else if (clear) {
          newThumbs[i] = null;
          console.log(`썸네일 ${i} 삭제`);
        }
      }
      update.$set.main_img = newThumbs;

      await users.updateOne({ id: uid }, update);
      const updated = await users.findOne({ id: uid });
      res.json({ user: updated });
    } catch (err) {
      console.error("PATCH /profile error:", err);
      if (err?.code === "auth/argument-error" || err?.code === "auth/id-token-expired") {
        return res.status(401).json({ error: "Invalid token" });
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

/* ------------------ is_auth 토글 (기존 코드 유지) ------------------ */
router.patch("/toggle-auth", async (req, res) => {
  try {
    const token = parseBearer(req);
    if (!token) return res.status(401).json({ error: "No token" });

    const { uid } = await admin.auth().verifyIdToken(token);

    const db = await getDB(req);
    const users = db.collection("users");

    const current = await users.findOne({ id: uid });
    if (!current) return res.status(404).json({ error: "User not found" });

    const nextVal = !Boolean(current.is_auth);
    await users.updateOne(
      { id: uid },
      { $set: { is_auth: nextVal, updatedAt: new Date() } }
    );

    const updated = await users.findOne({ id: uid });
    res.json({ user: updated });
  } catch (err) {
    console.error("PATCH /profile/toggle-auth error:", err);
    if (err?.code === "auth/argument-error" || err?.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "Failed to toggle is_auth" });
  }
});


// =======================================================================================
// ✅ [추가] 아래부터 초기 프로필 설정을 위한 API 입니다.
// =======================================================================================

/* ------------------ 1. 닉네임 중복 체크 API ------------------ */
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
      res.json({ available: !existingUser });
    } catch (err) {
      console.error("GET /profile/check-nickname error:", err);
      res.status(500).json({ error: "닉네임 확인 중 오류가 발생했습니다." });
    }
});
  
/* ------------------ 2. 프로필 이미지 업로드 API ------------------ */
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
  
/* ------------------ 3. 프로필 정보 최종 업데이트 API ------------------ */
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
          if (typeof profileImageUrl === 'string' && profileImageUrl) {
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

export default router;
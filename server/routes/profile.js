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

/* ------------------ 프로필 조회 ------------------ */
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

/* ------------------ 프로필 수정 (텍스트 + 파일) ------------------ */
/*
받아들일 필드:
- 텍스트: nickname, intro, address, phone_number,
         clear_profile_img, clear_thumbnail0/1/2 ('true'/'false')
- 파일: profile_img(1), thumbnail0/1/2 (각 1)
*/
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
      // Firebase Admin SDK 상태 확인
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

      // 텍스트 필드
      if (typeof body.nickname === "string") update.$set.nickname = body.nickname;
      if (typeof body.intro === "string") update.$set.intro = body.intro;
      if (typeof body.address === "string") update.$set.address = body.address;
      if (typeof body.phone_number === "string") update.$set.phone_number = body.phone_number;

      // 프로필 이미지
      const profileFile = files.profile_img?.[0];
      if (profileFile) {
        try {
          console.log("프로필 이미지 Firebase 업로드 시작:", profileFile.filename);
          
          // Firebase Storage 버킷 참조
          const bucket = admin.storage().bucket();
          
          // 파일 경로 생성
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 8);
          const destination = `profile_images/${uid}_${timestamp}_${randomId}`;
          
          // 로컬 파일 경로
          const filePath = profileFile.path;
          
          // Firebase Storage에 업로드
          await bucket.upload(filePath, {
            destination: destination,
            metadata: {
              contentType: profileFile.mimetype,
              metadata: {
                firebaseStorageDownloadTokens: uid // 토큰으로 사용자 ID 활용
              }
            }
          });
          
          // 업로드 후 공개 URL 생성
          const file = bucket.file(destination);
          const [metadata] = await file.getMetadata();
          
          // 파일 URL 생성
          const bucketName = bucket.name;
          const downloadToken = metadata.metadata.firebaseStorageDownloadTokens;
          const fileUrls = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;
          
          // URL을 프로필 이미지로 설정
          update.$set.profile_img = fileUrls;
          
          // 임시 파일 삭제
          fs.unlinkSync(filePath);

          console.log("프로필 이미지 Firebase 업로드 성공:", fileUrls);
        } catch (error) {
          console.error("Firebase 업로드 오류:", error);
          // 에러 발생 시 기존 방식으로 폴백
          update.$set.profile_img = fileUrl(profileFile.filename);
          console.log("로컬 URL로 대체:", update.$set.profile_img);
        }
      } else if (String(body.clear_profile_img).toLowerCase() === "true") {
        update.$set.profile_img = null;
        console.log("프로필 이미지 삭제");
      }

      // 썸네일 갱신(3칸)
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
            
            // Firebase Storage 버킷 참조
            const bucket = admin.storage().bucket();
            
            // 파일 경로 생성
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 8);
            const destination = `thumbnails/${uid}_${i}_${timestamp}_${randomId}`;
            
            // 로컬 파일 경로
            const filePath = f.path;
            
            // Firebase Storage에 업로드
            await bucket.upload(filePath, {
              destination: destination,
              metadata: {
                contentType: f.mimetype,
                metadata: {
                  firebaseStorageDownloadTokens: `${uid}_${i}` // 토큰으로 사용자 ID와 썸네일 번호 활용
                }
              }
            });
            
            // 업로드 후 공개 URL 생성
            const file = bucket.file(destination);
            const [metadata] = await file.getMetadata();
            
            // 파일 URL 생성
            const bucketName = bucket.name;
            const downloadToken = metadata.metadata.firebaseStorageDownloadTokens;
            const thumbnailUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;
            
            // URL을 썸네일로 설정
            newThumbs[i] = thumbnailUrl;
            
            // 임시 파일 삭제
            fs.unlinkSync(filePath);
            
            console.log(`썸네일 ${i} Firebase 업로드 성공:`, thumbnailUrl);
          } catch (error) {
            console.error(`썸네일 ${i} Firebase 업로드 오류:`, error);
            // 에러 발생 시에는 로컬 URL 사용 (폴백)
            newThumbs[i] = fileUrl(f.filename);
            console.log(`썸네일 ${i} 로컬 URL로 대체:`, newThumbs[i]);
          }
        } else if (clear) {
          newThumbs[i] = null;
          console.log(`썸네일 ${i} 삭제`);
        }
      }
      update.$set.thumbnail_list = newThumbs;

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

/* ------------------ is_auth 토글 ------------------ */
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

export default router;

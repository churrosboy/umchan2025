// routes/user.js
import express from 'express';
import { users } from '../models/user_model.js'; // ✅ 모델 import
import { Int32, Double } from 'mongodb';
import admin from "../firebaseAdmin.js"; // Firebase Admin 추가
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

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

// 📌 사용자 등록 API (기존 코드 + isProfileComplete 필드 추가)
router.post('/', async (req, res) => {
  try {
    const {
      uid,
      name, // signup4에서 name으로 보내므로 추가
      nickname,
      phone_number,
      postcode, // signup4에서 postcode도 보내므로 추가
      address,
      longitude,
      latitude,
      isProfileComplete
    } = req.body;

    // 유효성 체크
    if (!uid || !phone_number || !address || !longitude || !latitude) {
      return res.status(400).json({ message: "필수 입력값 누락" });
    }

    const userDoc = {
      id: String(uid),
      name: typeof name === 'string' ? name : '', // 이름 필드 추가
      nickname: typeof nickname === 'string' ? nickname : '',
      phone_number: String(phone_number),
      postcode: typeof postcode === 'string' ? postcode : '', // 우편번호 추가
      address: String(address),
      location: {
        type: "Point",
        coordinates: [ new Double(longitude), new Double(latitude) ]   // ✅ double
      },
      is_auth: false,                   // is_auth는 bool 허용
      item_num: new Int32(0),          // ✅ int
      recipe_num: new Int32(0),        // ✅ int
      review_num: new Int32(0),        // ✅ int
      avg_rating: new Double(0.0),     // ✅ double
      review_cnt: new Int32(0),        // ✅ int
      like_cnt: new Int32(0),          // ✅ int
      thumbnail_list: [],
      instant_cnt: new Int32(0),       // ✅ int
      reserve_cnt: new Int32(0),       // ✅ int
      profile_image: "",
      intro: "",
      isProfileComplete: Boolean(isProfileComplete), // 프로필 완성도 필드 추가
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await users.insertOne(userDoc);
    res.status(201).json({ message: "사용자 등록 성공", user: userDoc });
  } catch (err) {
    console.error("❌ 사용자 등록 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

/* ------------------ 닉네임 중복 체크 ------------------ */
router.get("/check-nickname", async (req, res) => {
  try {
    const { nickname } = req.query;
    
    if (!nickname || typeof nickname !== "string") {
      return res.status(400).json({ error: "닉네임을 입력해주세요." });
    }

    if (nickname.length < 2 || nickname.length > 10) {
      return res.status(400).json({ error: "닉네임은 2-10자 사이로 입력해주세요." });
    }

    // 닉네임이 이미 사용 중인지 확인
    const existingUser = await users.findOne({ nickname: nickname.trim() });
    const available = !existingUser;

    res.json({ available, nickname: nickname.trim() });
  } catch (err) {
    console.error("GET /users/check-nickname error:", err);
    res.status(500).json({ error: "닉네임 확인 중 오류가 발생했습니다." });
  }
});

/* ------------------ 프로필 완성도 체크 ------------------ */
router.get("/profile-status", async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({ error: "UID가 필요합니다." });
    }

    const user = await users.findOne({ id: uid });
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 프로필 완성도 확인
    const isProfileComplete = Boolean(user.isProfileComplete) && Boolean(user.nickname && user.nickname.trim().length > 0);

    res.json({ 
      isProfileComplete,
      hasNickname: Boolean(user.nickname),
      hasProfileImage: Boolean(user.profile_image),
      hasIntro: Boolean(user.intro),
    });
  } catch (err) {
    console.error("GET /users/profile-status error:", err);
    res.status(500).json({ error: "프로필 상태 확인 중 오류가 발생했습니다." });
  }
});

/* ------------------ 프로필 이미지만 업로드 ------------------ */
router.post("/upload-profile-image", 
  upload.single("profileImage"), 
  async (req, res) => {
    try {
      const { uid } = req.body;
      const profileImageFile = req.file;

      if (!uid) {
        return res.status(400).json({ error: "UID가 필요합니다." });
      }

      if (!profileImageFile) {
        return res.status(400).json({ error: "프로필 이미지가 필요합니다." });
      }

      const imageUrl = fileUrl(profileImageFile.filename);

      res.json({ 
        success: true,
        imageUrl,
        message: "프로필 이미지가 업로드되었습니다." 
      });

    } catch (err) {
      console.error("POST /users/upload-profile-image error:", err);
      res.status(500).json({ error: "이미지 업로드 중 오류가 발생했습니다." });
    }
  }
);

/* ------------------ 프로필 업데이트 ------------------ */
router.put("/update-profile", async (req, res) => {
  try {
    const token = parseBearer(req);
    if (!token) return res.status(401).json({ error: "No token" });

    const { uid: tokenUid } = await admin.auth().verifyIdToken(token);
    const { uid, nickname, introduction, profileImageUrl, isProfileComplete } = req.body;

    // 토큰의 UID와 요청의 UID가 일치하는지 확인
    if (uid && uid !== tokenUid) {
      return res.status(403).json({ error: "권한이 없습니다." });
    }

    const targetUid = uid || tokenUid;

    const currentUser = await users.findOne({ id: targetUid });
    if (!currentUser) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    const updateData = {
      updatedAt: new Date(),
    };

    // 닉네임 업데이트 (중복 체크)
    if (nickname) {
      if (nickname.trim().length < 2 || nickname.trim().length > 10) {
        return res.status(400).json({ error: "닉네임은 2-10자 사이로 입력해주세요." });
      }

      // 닉네임이 변경된 경우에만 중복 체크
      if (nickname.trim() !== currentUser.nickname) {
        const existingNickname = await users.findOne({ 
          nickname: nickname.trim(),
          id: { $ne: targetUid } 
        });
        
        if (existingNickname) {
          return res.status(400).json({ error: "이미 사용 중인 닉네임입니다." });
        }
      }

      updateData.nickname = nickname.trim();
    }

    // 한줄소개 업데이트
    if (typeof introduction === "string") {
      updateData.intro = introduction.trim();
    }

    // 프로필 이미지 URL 업데이트
    if (typeof profileImageUrl === "string") {
      updateData.profile_image = profileImageUrl || "";
    }

    // 프로필 완성도 업데이트
    if (typeof isProfileComplete === "boolean") {
      updateData.isProfileComplete = isProfileComplete;
    }

    // 데이터베이스 업데이트
    await users.updateOne(
      { id: targetUid },
      { $set: updateData }
    );

    const updatedUser = await users.findOne({ id: targetUid });
    
    res.json({ 
      success: true,
      message: "프로필이 업데이트되었습니다.",
      user: updatedUser 
    });

  } catch (err) {
    console.error("PUT /users/update-profile error:", err);
    if (err?.code === "auth/argument-error" || err?.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: "프로필 업데이트 중 오류가 발생했습니다." });
  }
});

export default router;
import express from "express";
import { getUserById, searchUsersByProduct, searchUserNicknameById } from "../controllers/userContoroller.js";
import { Int32, Double } from 'mongodb';
import { users } from '../models/user_model.js'; 
import admin from "../firebaseAdmin.js"; // Firebase Admin 추가
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

/* ------------------ 업로드 설정 추가 ------------------ */
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

/* ------------------ 기존 사용자 등록 라우트 (수정) ------------------ */
router.post('/', async (req, res) => {
  try {
    const {
      uid,
      name, // 추가
      nickname,
      phone_number,
      postcode, // 추가
      address,
      longitude,
      latitude,
      isProfileComplete // 추가
    } = req.body;

    if (!uid || !phone_number || !address || !longitude || !latitude) {
      return res.status(400).json({ message: "필수 입력값 누락" });
    }

    const userDoc = {
      id: String(uid),
      name: typeof name === 'string' ? name : '', // 추가
      nickname: typeof nickname === 'string' ? nickname : '',
      phone_number: String(phone_number),
      postcode: typeof postcode === 'string' ? postcode : '', // 추가
      address: String(address),
      location: {
        type: "Point",
        coordinates: [ new Double(longitude), new Double(latitude) ]
      },
      is_auth: false,
      item_num: new Int32(0),
      recipe_num: new Int32(0),
      review_num: new Int32(0),
      avg_rating: new Double(0.0),
      review_cnt: new Int32(0),
      like_cnt: new Int32(0),
      thumbnail_list: [],
      instant_cnt: new Int32(0),
      reserve_cnt: new Int32(0),
      profile_image: "",
      intro: "",
      isProfileComplete: Boolean(isProfileComplete), // 추가
      createdAt: new Date(),

    };

    await users.insertOne(userDoc);
    res.status(201).json({ message: "사용자 등록 성공", user: userDoc });
  } catch (err) {
    console.error("⌐ 사용자 등록 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

/* ------------------ 닉네임 중복 체크 수정 ------------------ */
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

    // 대소문자를 구분하지 않고, 앞뒤 공백을 제거하여 검색
    const existingUser = await users.findOne({ 
      nickname: { 
        $regex: new RegExp(`^${trimmedNickname}$`, 'i') // 대소문자 무시
      } 
    });
    
    const available = !existingUser;

    // 디버깅을 위한 로그 추가
    console.log('닉네임 중복 체크:', {
      requestedNickname: trimmedNickname,
      foundUser: existingUser ? existingUser.nickname : null,
      available
    });

    res.json({ 
      available, 
      nickname: trimmedNickname,
      message: available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.'
    });
  } catch (err) {
    console.error("GET /users/check-nickname error:", err);
    res.status(500).json({ error: "닉네임 확인 중 오류가 발생했습니다." });
  }
});

/* ------------------ 프로필 완성도 체크 추가 ------------------ */
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

/* ------------------ 프로필 이미지 업로드 추가 ------------------ */
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

/* ------------------ 프로필 업데이트 수정 ------------------ */
router.put("/update-profile", async (req, res) => {
  try {
    const token = parseBearer(req);
    if (!token) return res.status(401).json({ error: "No token" });

    const { uid: tokenUid } = await admin.auth().verifyIdToken(token);
    const { uid, nickname, introduction, profileImageUrl, isProfileComplete } = req.body;

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

    if (nickname) {
      const trimmedNickname = nickname.trim();
      
      if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
        return res.status(400).json({ error: "닉네임은 2-10자 사이로 입력해주세요." });
      }

      // 현재 사용자의 닉네임과 다른 경우에만 중복 체크
      if (trimmedNickname.toLowerCase() !== (currentUser.nickname || '').toLowerCase()) {
        const existingNickname = await users.findOne({ 
          nickname: { 
            $regex: new RegExp(`^${trimmedNickname}$`, 'i') // 대소문자 무시
          },
          id: { $ne: targetUid } 
        });
        
        if (existingNickname) {
          console.log('중복된 닉네임 발견:', {
            requestedNickname: trimmedNickname,
            existingNickname: existingNickname.nickname,
            existingUserId: existingNickname.id
          });
          return res.status(400).json({ error: "이미 사용 중인 닉네임입니다." });
        }
      }

      updateData.nickname = trimmedNickname;
    }

    if (typeof introduction === "string") {
      updateData.intro = introduction.trim();
    }

    if (typeof profileImageUrl === "string") {
      updateData.profile_image = profileImageUrl || "";
    }

    if (typeof isProfileComplete === "boolean") {
      updateData.isProfileComplete = isProfileComplete;
    }

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

/* ------------------ 기존 라우트들 유지 ------------------ */
// 사용자 ID로 조회
router.get("/:id", getUserById);

// 인증된 사용자 중 검색어에 해당하는 상품을 가진 사용자 검색
router.get("/search/product", searchUsersByProduct);

router.get("/nickname/:nickname", searchUserNicknameById);

export default router;
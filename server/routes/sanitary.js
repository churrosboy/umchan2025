// routes/sanitary.js
import express from 'express';
import admin from '../firebaseAdmin.js';
import connect from '../connect.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 업로드 폴더 준비 (기존 profile 라우트와 동일 규칙)
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, '_')
      .replace(/[^\w.-]/g, '');
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${base}${ext}`);
  },
});
const upload = multer({ storage });
const fileUrl = (filename) => `/api/uploads/${filename}`;

// 현재 내 인증요청 조회 (있으면 반환)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const { uid } = await admin.auth().verifyIdToken(token);

    const { db } = await connect();
    const col = db.collection('auth_management');
    const doc = await col.findOne({ user_id: uid }, { sort: { updatedAt: -1 } });

    res.json({ request: doc || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load sanitary request' });
  }
});

// 인증요청 생성/갱신 (사진 1장 필수)
router.post('/request', upload.single('kitchen_image'), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const { uid } = await admin.auth().verifyIdToken(token);

    if (!req.file) return res.status(400).json({ error: 'Image required' });

    const { db } = await connect();
    const col = db.collection('auth_management');

    const now = new Date();
    const image_url = fileUrl(req.file.filename);

    // 사용자별 한 건만 유지하고 싶으면 upsert
    await col.updateOne(
      { user_id: uid },
      {
        $set: {
          user_id: uid,
          image_url,
          status: 'pending',
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

    const saved = await col.findOne({ user_id: uid });
    res.json({ ok: true, request: saved });
  } catch (err) {
    console.error(err);
    if (err?.code === 'auth/argument-error') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Failed to create request' });
  }
});

export default router;

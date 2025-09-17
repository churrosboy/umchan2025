import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connect from './connect.js';
import path from 'path';
import { fileURLToPath } from 'url';
import recipeRoutes from './routes/recipeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import productRoutes from './routes/productRoutes.js';
import sellerRoutes from './routes/sellers.js';
import profileRouter from './routes/profile.js';
import sanitaryRouter from './routes/sanitary.js';
import geocodeRouter from './routes/geocode.js';
import orderRoutes from './routes/orderRoutes.js';
import admin from 'firebase-admin';
import fs from 'fs';
import reviewsRouter from './routes/reviews.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON 파일 직접 읽기
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = express();

// Firebase Admin SDK 초기화
try {
  admin.app(); // 이미 초기화된 앱이 있는지 확인
  console.log('Firebase 앱이 이미 초기화되어 있습니다.');
} catch (error) {
  // 앱이 초기화되지 않았을 때만 초기화
  // serviceAccount에서 프로젝트 ID 가져오기
  const projectId = serviceAccount.project_id;
  console.log('Firebase 프로젝트 ID:', projectId);
  
  // 버킷 이름 생성 (일반적인 패턴)
  const bucketName = `${projectId}.appspot.com`;
  console.log('Firebase Storage 버킷 이름:', bucketName);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucketName
  });
  console.log('Firebase 앱을 새로 초기화했습니다.');
}

// 업로드 폴더의 절대경로 지정
const uploadsDir = path.resolve(process.cwd(), 'uploads');
// ✅ 정적 서빙: /api/uploads/** -> uploads 디렉터리 파일 제공
app.use('/api/uploads', express.static(uploadsDir));

app.use(cors({ 
  origin: [
    'http://localhost:3000'
  ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/api/geocode', geocodeRouter);

// 기본 경로 처리
app.get("/", (req, res) => {
  res.send("API 서버가 실행 중입니다.");
});

app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/profile', profileRouter); // 프로필 라우터
app.use('/api/sanitary', sanitaryRouter); // 위생인증 요청 라우터
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewsRouter);

const PORT = process.env.PORT || 4000;
connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ 서버 실행: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ 서버 실행 실패:", err);
  });
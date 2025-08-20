// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRouter from './routes/users.js';
import geocodeRouter from './routes/geocode.js';
import sellerRoutes from './routes/sellers.js';
import profileRouter from './routes/profile.js';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 업로드 폴더의 절대경로 지정
const uploadsDir = path.resolve(process.cwd(), 'uploads');

// ✅ 정적 서빙: /api/uploads/** -> uploads 디렉터리 파일 제공
app.use('/api/uploads', express.static(uploadsDir));

app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());

app.use('/api/users', userRouter); // ✅ user router mount
app.use('/api/geocode', geocodeRouter);
app.use("/api/sellers", sellerRoutes);
app.use('/api/profile', profileRouter); // 프로필 라우터

app.listen(5050, () => {
  console.log('✅ 서버 실행: http://localhost:5050');
});
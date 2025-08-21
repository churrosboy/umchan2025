import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connect from './connect.js';
import recipeRoutes from './routes/recipeRoutes.js';
import userRoutes from './routes/userRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import productRoutes from './routes/productRoutes.js';
import sellerRoutes from './routes/sellers.js';
import geocodeRouter from './routes/geocode.js';

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
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
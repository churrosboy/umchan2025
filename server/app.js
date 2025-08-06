// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/users.js';
import geocodeRouter from './routes/geocode.js';
import sellerRoutes from './routes/sellers.js';


dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());

app.use('/api/users', userRouter); // ✅ user router mount
app.use('/api/geocode', geocodeRouter);
app.use("/api/sellers", sellerRoutes);

app.listen(5050, () => {
  console.log('✅ 서버 실행: http://localhost:5050');
});
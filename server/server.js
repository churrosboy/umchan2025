const express = require("express");
const mongoose = require("mongoose");
//////////////////////////////////////////////
const http = require("http");
const { Server } = require("socket.io");
///////////////////////////////////////////////
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes');
const historyRoutes = require('./routes/historyRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
//////////////////////////////////////////
const server = http.createServer(app);
const io = new Server(server);
///////////////////////////////////////////'

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 정적 파일 서빙 (이미지 접근용)
app.use('/uploads', express.static('uploads'));

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("📦 MongoDB 연결 완료");
}).catch(err => {
  console.error("❌ MongoDB 연결 실패:", err);
});

// WebSocket 설정//////////////////////////////////////////////////////
io.on('connection', (socket) => {
  console.log('사용자가 연결되었습니다:', socket.id);

  socket.on('message', (data) => {
    console.log('메시지 수신:', data);
    io.emit('message', data); // 모든 클라이언트에게 메시지 브로드캐스트
  });

  socket.on('disconnect', () => {
    console.log('사용자가 연결을 끊었습니다:', socket.id);
  });
});
///////////////////////////////////////////////////////////////////////

// 기본 경로 처리
app.get("/", (req, res) => {
  res.send("API 서버가 실행 중입니다.");
});

// API 라우트 연결
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/products', productRoutes);

// 서버 실행
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
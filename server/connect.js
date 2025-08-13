import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

if (!uri) {
  throw new Error("❌ MONGO_URI 환경변수가 설정되지 않았습니다.");
}

async function connect() {
  try {
    console.log('✅ MongoDB 연결 시도 중...');
    await mongoose.connect(uri, {
      dbName: 'momchance'
    });
    console.log('✅ Mongoose 연결 성공!');
  } catch (err) {
    console.error('❌ Mongoose 연결 실패:', err);
    throw err;
  }
}

export default connect;
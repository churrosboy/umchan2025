// connect.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

if (!uri) {
  throw new Error("❌ MONGO_URI 환경변수가 설정되지 않았습니다.");
}

const client = new MongoClient(uri);

async function connect() {
  try {
    console.log('✅ MongoDB 연결 시도 중...');
    await client.connect();
    console.log('✅ MongoDB 연결 성공!');
    const db = client.db('momchance'); // DB 이름은 상황에 맞게 변경 가능
    return { db, client };
  } catch (err) {
    console.error('❌ MongoDB 연결 실패:', err);
    throw err;
  }
}

export default connect;

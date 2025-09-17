import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname 설정 (ESM에서는 __dirname이 기본 제공되지 않음)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 서비스 계정 키 파일 경로
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at: ${serviceAccountPath}`);
  process.exit(1);
}

// 서비스 계정 키 읽기
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Firebase Admin 초기화 - storageBucket 옵션 추가
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // 여기에 storageBucket 옵션을 추가
  storageBucket: "umchan-eb63f.firebasestorage.app"  // Firebase 프로젝트의 버킷 이름
});

export default admin;
// utils/firebaseUpload.js
import admin from "../firebaseAdmin.js";
import fs from "fs";

/**
 * 로컬 파일을 Firebase Storage(GCS)에 업로드하고 다운로드 가능한 URL을 반환
 * @param {string} localPath - multer가 저장한 로컬 경로
 * @param {string} destination - GCS 저장 경로 (ex: reviews/{uid}/{reviewId}/img_0_...)
 * @param {string} contentType - MIME
 * @param {object} [customMeta] - metadata.metadata에 들어갈 커스텀 키
 * @returns {Promise<string>} 다운로드 URL
 */
export async function uploadLocalFileToGCS(localPath, destination, contentType, customMeta = {}) {
  const bucket = admin.storage().bucket();

  await bucket.upload(localPath, {
    destination,
    metadata: {
      contentType,
      metadata: {
        ...customMeta,
      },
    },
  });

  // 로컬 임시파일 제거
  try { fs.unlinkSync(localPath); } catch {}

  const file = bucket.file(destination);
  const [metadata] = await file.getMetadata();

  const bucketName = bucket.name;
  let token = metadata?.metadata?.firebaseStorageDownloadTokens;

  // 토큰이 없으면 부여
  if (!token) {
    token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
  }

  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(destination)}?alt=media&token=${token}`;
}

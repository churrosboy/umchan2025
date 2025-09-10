import admin from '../firebaseAdmin.js'; // 프로젝트에 이미 있는 admin 초기화 파일 재사용

export async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No Authorization header' });
    }
    const token = authHeader.slice(7);
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid };
    return next();
  } catch (err) {
    console.error('verifyFirebaseToken error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

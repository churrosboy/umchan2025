import mongoose from 'mongoose';
import Product from '../models/Product.js';

export async function completeTrade(req, res) {
  try {
    const { sellerId, buyerId, item_id, type } = req.body || {};
    if (!sellerId || !buyerId || !item_id || !type) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    if (!['즉시', '예약'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }

    // 1) 상품이 실제 sellerId 소유인지 검증
    const product = await Product.findOne({ item_id, user_id: sellerId }).lean();
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없거나 판매자 소유가 아닙니다.' });
    }

    // 2) users 컬렉션 카운트 +1 (드라이버 방식으로 컬렉션 직접 접근: 충돌 최소화)
    const usersCol = mongoose.connection.db.collection('users'); // 컬렉션명이 'users' 라는 가정(실데이터와 일치)
    const incField = type === '즉시' ? { instant_cnt: 1 } : { reserve_cnt: 1 };
    const upd = await usersCol.updateOne({ id: String(sellerId) }, { $inc: incField });

    if (upd.matchedCount === 0) {
      return res.status(404).json({ error: '판매자 유저 문서를 찾을 수 없습니다.' });
    }

    // (선택) 거래 로그 기록하려면 여기서 별도 collection에 insertOne

    return res.json({ ok: true });
  } catch (err) {
    console.error('completeTrade error:', err);
    return res.status(500).json({ error: '서버 오류' });
  }
}

// server/controllers/reviewController.js
import Review from '../models/Review.js';
import { users } from '../models/user_model.js'; // 👈 Native Driver 컬렉션 import

export async function createReview(req, res) {
  try {
    let { seller_id, writer_id, item_id = '', rating, content = '', image_url = [], timestamp } = req.body || {};

    rating = Number(rating);
    if (!seller_id || !writer_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: '필수 필드 누락 또는 잘못된 rating' });
    }
    if (!Array.isArray(image_url)) image_url = [];

    // 1) 리뷰 저장 (Mongoose)
    const doc = new Review({
      seller_id: String(seller_id),
      writer_id: String(writer_id),
      item_id:   String(item_id || ''),
      rating,
      content:   String(content || ''),
      image_url,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });
    const saved = await doc.save();

    // 2) 집계 반영 (Native Driver 파이프라인 업데이트)
    //  - review_cnt += 1
    //  - rating_sum += rating    (없으면 0에서 시작)
    //  - avg_rating = round(rating_sum / review_cnt, 2)
    await users.updateOne(
      { id: String(seller_id) },
      [
        {
          $set: {
            _new_cnt: { $add: [ { $ifNull: ['$review_cnt', 0] }, 1 ] },
            _new_sum: { $add: [ { $ifNull: ['$rating_sum', 0] }, rating ] }
          }
        },
        {
          $set: {
            review_cnt: '$_new_cnt',
            rating_sum: '$_new_sum',
            avg_rating: { $round: [ { $divide: ['$_new_sum', '$_new_cnt'] }, 2 ] }
          }
        },
        { $unset: ['_new_cnt', '_new_sum'] }
      ],
      { upsert: true }
    );

    return res.status(201).json({ ok: true, review: saved });
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ error: `서버 오류: ${err.message}` });
  }
}

// PATCH /api/reviews/:id
export async function updateReview(req, res) {
  try {
    const { id } = req.params;
    const uid = req.user?.uid; // verifyFirebaseToken에서 셋팅
    let { rating, content, image_url } = req.body || {};

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: '리뷰를 찾을 수 없습니다.' });
    if (!uid || String(review.writer_id) !== String(uid)) {
      return res.status(403).json({ error: '리뷰 수정 권한이 없습니다.' });
    }

    // 변경 전 값들
    const oldRating = Number(review.rating) || 0;
    const sellerId = String(review.seller_id);

    // 업데이트 가능한 필드만
    let ratingChanged = false;
    if (rating !== undefined) {
      const newRating = Number(rating);
      if (!newRating || newRating < 1 || newRating > 5) {
        return res.status(400).json({ error: 'rating은 1~5 사이의 숫자여야 합니다.' });
      }
      if (newRating !== oldRating) {
        review.rating = newRating;
        ratingChanged = true;
      }
    }
    if (content !== undefined) review.content = String(content);
    if (image_url !== undefined) {
      review.image_url = Array.isArray(image_url) ? image_url : [];
    }
    review.timestamp = new Date();

    const saved = await review.save();

    // 별점이 바뀐 경우에만 집계 보정
    if (ratingChanged) {
      const delta = Number(saved.rating) - oldRating;
      await users.updateOne(
        { id: sellerId },
        [
          {
            $set: {
              _new_sum: { $add: [ { $ifNull: ['$rating_sum', 0] }, delta ] }
            }
          },
          {
            $set: {
              rating_sum: '$_new_sum',
              avg_rating: {
                $cond: [
                  { $gt: [ { $ifNull: ['$review_cnt', 0] }, 0 ] },
                  { $round: [ { $divide: ['$_new_sum', { $ifNull: ['$review_cnt', 0] }] }, 2 ] },
                  0
                ]
              }
            }
          },
          { $unset: ['_new_sum'] }
        ]
      );
    }

    return res.json({ ok: true, review: saved });
  } catch (err) {
    console.error('updateReview error:', err);
    return res.status(500).json({ error: `서버 오류: ${err.message}` });
  }
}

// DELETE /api/reviews/:id
export async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    const uid = req.user?.uid;

    // 삭제 전에 기존 리뷰를 가져와서 집계에 사용할 값 확보
    const review = await Review.findById(id).lean();
    if (!review) return res.status(404).json({ error: '리뷰를 찾을 수 없습니다.' });
    if (!uid || String(review.writer_id) !== String(uid)) {
      return res.status(403).json({ error: '리뷰 삭제 권한이 없습니다.' });
    }

    const oldRating = Number(review.rating) || 0;
    const sellerId = String(review.seller_id);

    await Review.deleteOne({ _id: id });

    // 집계 감소 (음수 방지 + 0 분모 처리)
    await users.updateOne(
      { id: sellerId },
      [
        {
          $set: {
            _new_cnt: { $max: [ { $subtract: [ { $ifNull: ['$review_cnt', 0] }, 1 ] }, 0 ] },
            _new_sum: { $max: [ { $subtract: [ { $ifNull: ['$rating_sum', 0] }, oldRating ] }, 0 ] }
          }
        },
        {
          $set: {
            review_cnt: '$_new_cnt',
            rating_sum: '$_new_sum',
            avg_rating: {
              $cond: [
                { $gt: ['$_new_cnt', 0] },
                { $round: [ { $divide: ['$_new_sum', '$_new_cnt'] }, 2 ] },
                0
              ]
            }
          }
        },
        { $unset: ['_new_cnt', '_new_sum'] }
      ]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('deleteReview error:', err);
    return res.status(500).json({ error: `서버 오류: ${err.message}` });
  }
}

export async function getMyReviews(req, res) {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const docs = await Review
      .find({ writer_id: String(uid) })
      .sort({ timestamp: -1 })
      .lean();

    return res.json(docs || []);
  } catch (err) {
    console.error('getMyReviews error:', err);
    return res.status(500).json({ error: '서버 오류' });
  }
}
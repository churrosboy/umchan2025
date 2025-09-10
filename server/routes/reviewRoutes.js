// server/routes/reviewRoutes.js
import express from 'express';
import { verifyFirebaseToken } from '../middlewares/authMiddleware.js';
import { createReview } from '../controllers/reviewController.js';
import { updateReview, deleteReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/ping', (req, res) => res.json({ ok: true, where: 'reviews' }));

// 생성
router.post('/', verifyFirebaseToken, createReview);

// 수정
router.patch('/:id', verifyFirebaseToken, updateReview);

// 삭제
router.delete('/:id', verifyFirebaseToken, deleteReview);

export default router;

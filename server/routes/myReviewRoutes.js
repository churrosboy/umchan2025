import express from 'express';
import { verifyFirebaseToken } from '../middlewares/authMiddleware.js';
import { getMyReviews } from '../controllers/reviewController.js';

const router = express.Router();

// 작성자 본인의 리뷰 목록
router.get('/', verifyFirebaseToken, getMyReviews);

export default router;

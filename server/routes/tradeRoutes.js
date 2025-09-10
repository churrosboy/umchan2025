import express from 'express';
import { verifyFirebaseToken } from '../middlewares/authMiddleware.js';
import { completeTrade } from '../controllers/tradeController.js';

const router = express.Router();

router.post('/complete', verifyFirebaseToken, completeTrade);

export default router;

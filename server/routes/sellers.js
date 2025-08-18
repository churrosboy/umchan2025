import express from 'express';
import { getSellers } from '../controllers/sellerController.js';

const router = express.Router();
router.get('/', getSellers);
export default router;
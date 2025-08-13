import express from 'express';
import multer from 'multer';
import path from 'path';
import { createProduct, getAllProducts, getProductsByUserId, getProductById } from '../controllers/productController.js';

const router = express.Router();

// 이미지 업로드 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 판매 품목 등록
router.post('/', upload.array('images', 10), createProduct);

// 모든 상품 조회
router.get('/', getAllProducts);

// 특정 사용자의 상품 조회
router.get('/user/:userId', getProductsByUserId);

// 특정 상품 조회
router.get('/:itemId', getProductById);

export default router;

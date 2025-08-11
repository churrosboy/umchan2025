const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createProduct, getAllProducts, getProductsByUserId, getProductById } = require('../controllers/productController');

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

router.get('/:itemId', getProductById);

module.exports = router;

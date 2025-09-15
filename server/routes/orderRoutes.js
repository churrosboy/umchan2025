import express from 'express';
import { createOrder, getSellerOrders, getBuyerOrders, deleteOrder } from '../controllers/orderController.js';

const router = express.Router();

// 주문 생성
router.post('/', createOrder);

// 판매자 주문 조회
router.get('/seller/:sellerId', getSellerOrders);

// 구매자 주문 조회
router.get('/buyer/:buyerId', getBuyerOrders);

// 특정 주문 삭제
router.delete('/:orderId', deleteOrder);

export default router;

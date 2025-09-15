import express from 'express';
import { createOrder, getSellerOrders, getBuyerOrders, deleteOrder } from '../controllers/orderController.js';

const router = express.Router();

// 주문 생성
router.post('/', createOrder);

// 특정 주문 삭제
router.delete('/:orderId', deleteOrder);

//로그인한 사용자의 판매내역 조회
router.get('/seller', getSellerOrders);

//로그인한 사용자의 구매내역 조회
router.get('/buyer', getBuyerOrders);

export default router;

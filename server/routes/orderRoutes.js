import express from 'express';
import { createOrder, getSellerOrders, getBuyerOrders, cancelOrder, confirmOrder } from '../controllers/orderController.js';
import { patch } from 'semver';

const router = express.Router();

// 주문 생성
router.post('/', createOrder);

// 특정 주문 취소
router.patch('/:orderId', cancelOrder);

//로그인한 사용자의 판매내역 조회
router.get('/seller', getSellerOrders);

//로그인한 사용자의 구매내역 조회
router.get('/buyer', getBuyerOrders);

//주문 상태 변경
router.patch('/:orderId/confirm', confirmOrder);

export default router;

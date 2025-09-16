import Order from '../models/Orders.js';
import admin from 'firebase-admin';

// 토큰 추출 함수
function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  return parts.length === 2 ? parts[1] : null;
}

// 주문 생성
export async function createOrder(req, res) {
  try {
    console.log('=== Order 생성 요청 ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const order_id = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const { seller_id, buyer_id, item_id, location } = req.body;

    const order = new Order({
      order_id,
      seller_id,
      buyer_id,
      item_id,
      location
    });

    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      order: savedOrder,
      message: '주문이 성공적으로 생성되었습니다.'
    });

  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: '주문 생성 중 오류가 발생했습니다.'
    });
  }
}

export async function getSellerOrders(req, res) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const myUid = decoded.uid;

    const orders = await Order.find({ seller_id: myUid }).sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

export async function getBuyerOrders(req, res) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const myUid = decoded.uid;

    const orders = await Order.find({ buyer_id: myUid }).sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

// 주문 취소 (상태 변경)
export async function cancelOrder(req, res) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ success: false, message: "No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const myUid = decoded.uid;

    const { orderId } = req.params;
    // 구매자 또는 판매자만 취소 가능
    const order = await Order.findOne({
      order_id: orderId,
      $or: [{ buyer_id: myUid }, { seller_id: myUid }]
    });

    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }

    // 상태를 'cancelled'로 변경
    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      order,
      message: '주문이 성공적으로 취소되었습니다.'
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message,
      message: '토큰 검증 실패 또는 주문 취소 중 오류가 발생했습니다.'
    });
  }
}

// 주문 확정 (상태 변경)
export async function confirmOrder(req, res) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ success: false, message: "No token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const myUid = decoded.uid;

    const { orderId } = req.params;
    // 구매자만 확정 가능
    const order = await Order.findOne({
      order_id: orderId,
      buyer_id: myUid
    });

    if (!order) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }

    // 상태를 'completed'로 변경
    order.status = 'completed';
    await order.save();

    res.json({
      success: true,
      order,
      message: '주문이 성공적으로 확정되었습니다.'
    });
  } catch (err) {
    res .status(401).json({
      success: false,
      error: err.message,
      message: '토큰 검증 실패 또는 주문 확정 중 오류가 발생했습니다.'
    });
  }
}
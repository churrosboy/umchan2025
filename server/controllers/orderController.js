import Order from '../models/Orders.js';
import Cart from '../models/Cart.js';

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
  try {
    const { sellerId } = req.params;
    const orders = await Order.find({ seller_id: sellerId }).sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBuyerOrders(req, res) {
  try {
    const { buyerId } = req.params;
    const orders = await Order.find({ buyer_id: buyerId }).sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 특정 주문 삭제
export async function deleteOrder(req, res) {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findOneAndDelete({ order_id: orderId });
    if (!deletedOrder) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    res.json({
      success: true,
      order: deletedOrder,
      message: '주문이 성공적으로 삭제되었습니다.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: '주문 삭제중 오류가 발생했습니다.'
    });
  }
}
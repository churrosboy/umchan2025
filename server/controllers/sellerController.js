import Seller from '../models/Sellers.js';

export async function getSellers(req, res) {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
}
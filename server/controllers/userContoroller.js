import { users as User } from "../models/user_model.js";
import Product from "../models/Product.js";

// 사용자 ID로 조회
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findOne({ id: String(id) });

    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("❌ 사용자 조회 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}

// 검색어에 해당하는 상품을 가진 인증된 사용자만 반환
export async function searchUsersByProduct(req, res) {
  try {
    const keyword = (req.query.keyword || '').toLowerCase();
    if (!keyword) return res.status(400).json([]);

    // 1. 상품에서 검색어로 필터링
    const products = await Product.find({ name: { $regex: keyword, $options: 'i' } });
    if (!products.length) return res.json([]);
    console.log("Matching products:", products);

    // 2. 해당 상품의 user_id 추출
    const userIds = [...new Set(products.map(p => p.user_id))];
    console.log("User IDs from products:", userIds);
    // 3. 인증된 사용자만 조회
    const users = await User.find({ id: { $in: userIds.map(id => String(id)) }, is_auth: true }).toArray();

    // 4. 각 사용자별로 매칭된 상품 포함
    const result = users.map(user => {
      const matchingProducts = products.filter(p => String(p.user_id) === String(user.id));
      return {
        ...user,
        matchingProducts
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json([]);
  }
}
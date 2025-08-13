import Product from '../models/Product.js';

// 판매 품목 등록
export async function createProduct(req, res) {
  try {
    console.log('=== Product 등록 요청 ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    let imageUrls = [];

    // 방법 1: upload.array('images', 10) 사용 시
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      console.log(`${req.files.length}개의 파일이 업로드됨 (array 방식)`);
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }
    // 방법 2: upload.fields() 사용 시
    else if (req.files && typeof req.files === 'object') {
      Object.keys(req.files).forEach(key => {
        if (/^images\d*$/.test(key)) {
          const files = req.files[key];
          if (Array.isArray(files)) {
            files.forEach(file => imageUrls.push(`/uploads/${file.filename}`));
          } else if (files) {
            imageUrls.push(`/uploads/${files.filename}`);
          }
        }
      });
    }

    if (imageUrls.length === 0) {
      console.log('업로드된 이미지가 없습니다.');
    }

    const item_id = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const { user_id, name, type, reserve_end, info, price } = req.body;

    const product = new Product({
      item_id,
      user_id,
      name,
      type,
      images: imageUrls,
      reserve_end: reserve_end || '0',
      info,
      price,
      created_at: new Date()
    });

    const savedProduct = await product.save();
    res.status(201).json({
      success: true,
      product: savedProduct,
      message: '상품이 성공적으로 등록되었습니다.'
    });

  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: '상품 등록 중 오류가 발생했습니다.'
    });
  }
}

// 모든 상품 조회
export async function getAllProducts(req, res) {
  try {
    const products = await Product.find().sort({ created_at: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 특정 사용자의 상품 조회
export async function getProductsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const products = await Product.find({ user_id: userId }).sort({ created_at: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 특정 상품 조회 (item_id로)
export async function getProductById(req, res) {
  try {
    const { itemId } = req.params;
    const product = await Product.findOne({ item_id: itemId });

    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
}

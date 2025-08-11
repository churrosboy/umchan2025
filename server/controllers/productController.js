const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    console.log('=== Product 등록 요청 ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    // 이미지 경로 처리
    let imageUrls = [];
    
    // 방법 1: upload.array('images', 10) 사용 시
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      console.log(`${req.files.length}개의 파일이 업로드됨 (array 방식)`);
      imageUrls = req.files.map(file => {
        console.log('File info:', {
          originalname: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size
        });
        return `/uploads/${file.filename}`;
      });
    }
    // 방법 2: upload.fields() 사용 시 (여러 필드로 이미지 구분)
    else if (req.files && typeof req.files === 'object') {
      console.log('Files received (fields 방식):', Object.keys(req.files));
      
      // images0, images1, images2... 형태로 받은 경우
      Object.keys(req.files).forEach(key => {
        if (/^images\d*$/.test(key)) {
          const files = req.files[key];
          if (Array.isArray(files)) {
            files.forEach(file => {
              console.log('Field file info:', {
                fieldname: file.fieldname,
                originalname: file.originalname,
                filename: file.filename,
                size: file.size
              });
              imageUrls.push(`/uploads/${file.filename}`);
            });
          } else if (files) {
            console.log('Single field file info:', {
              fieldname: files.fieldname,
              originalname: files.originalname,
              filename: files.filename,
              size: files.size
            });
            imageUrls.push(`/uploads/${files.filename}`);
          }
        }
      });
    }
    
    console.log('Generated image URLs:', imageUrls);
    
    if (imageUrls.length === 0) {
      console.log('업로드된 이미지가 없습니다.');
    }

    // 고유 item_id 생성
    const item_id = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // 요청 데이터 추출
    const { user_id, name, type, reserve_end, info, price } = req.body;
    
    console.log('Creating product with data:', {
      item_id,
      user_id,
      name,
      type,
      reserve_end: reserve_end || '0',
      info,
      price,
      images: imageUrls
    });

    // Product 모델로 저장
    const product = new Product({
      item_id,
      user_id,
      name,
      type,
      images: imageUrls, // 이미지 URL 배열
      reserve_end: reserve_end || '0',
      info,
      price,
      created_at: new Date()
    });

    const savedProduct = await product.save();
    console.log('Product saved successfully:', savedProduct);
    
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
};

// 모든 상품 조회
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ created_at: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 특정 사용자의 상품 조회
exports.getProductsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const products = await Product.find({ user_id: userId }).sort({ created_at: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 특정 상품 조회 (item_id로)
exports.getProductById = async (req, res) => {
  try {
    const { itemId } = req.params;
    console.log('Searching for product with item_id:', itemId);
    
    const product = await Product.findOne({ item_id: itemId });
    
    if (!product) {
      console.log('Product not found for item_id:', itemId);
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    
    console.log('Product found:', product);
    res.json(product);
  } catch (err) {
    console.error('Product fetch error:', err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

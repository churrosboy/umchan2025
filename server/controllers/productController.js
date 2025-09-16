import Product from '../models/Product.js';
import admin from 'firebase-admin';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// 판매 품목 등록
export async function createProduct(req, res) {
  try {
    console.log('=== Product 등록 요청 ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    let imageUrls = [];

    /*

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
    */

    // Firebase Storage에 이미지 업로드
    imageUrls = []; // 변수 재선언 방지

    try {
      // 버킷 이름을 명시적으로 지정
      const bucket = admin.storage().bucket('umchan-eb63f.firebasestorage.app');
      
      const files = req.files || [];
      
      for (const file of files) {
        const destination = `products/${file.filename}`;
        
        console.log(`파일 업로드 시작: ${file.filename} -> ${destination}`);
        
        await bucket.upload(file.path, {
          destination,
          metadata: {
            contentType: file.mimetype,
            metadata: {
              firebaseStorageDownloadTokens: uuidv4()
            }
          }
        });
        
        // Storage 파일의 public URL 생성 (토큰 기반 URL)
        const downloadToken = uuidv4();
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${downloadToken}`;

        // console.log(`생성된 URL: ${url}`);
        imageUrls.push(url);
        
        // 임시 파일 삭제
        fs.unlinkSync(file.path);
      }
    } catch (storageError) {
      console.error('Firebase Storage 업로드 실패:', storageError);
      
      // 실패 시 로컬 파일 경로 사용 (대체 방안)
      if (req.files && Array.isArray(req.files)) {
        imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        console.log('로컬 경로로 대체:', imageUrls);
      }
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/MenuDetail.module.css';
const API_URL = process.env.REACT_APP_API_URL;

const MenuDetail = () => {
  const { menuId } = useParams(); // menuId = item_id
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/products/${menuId}`);

        if (!response.ok) {
          throw new Error('상품을 찾을 수 없습니다.');
        }
        
        const data = await response.json();
        setProduct(data);
        setCurrentImageIndex(0); // 새 상품 로드 시 첫 번째 이미지로 리셋
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (menuId) {
      fetchProduct();
    }
  }, [menuId]);

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) return <div className={styles.wrapper}>로딩 중...</div>;
  if (error) return <div className={styles.wrapper}>에러: {error}</div>;
  if (!product) return <div className={styles.wrapper}>메뉴를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrapper}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        &lt; 뒤로가기
      </button>

      <div className={styles.imageBox}>
        {product.images && product.images.length > 0 ? (
          <div style={{ position: 'relative' }}>
            <img 
              src={`${API_URL}${product.images[currentImageIndex]}`} 
              alt={`${product.name} ${currentImageIndex + 1}`}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            
            {/* 이미지가 2개 이상일 때만 버튼 표시 */}
            {product.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  &#8249;
                </button>
                
                <button 
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  &#8250;
                </button>
                
                {/* 이미지 인디케이터 (점) */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '5px'
                }}>
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          '상세사진 영역'
        )}
      </div>

      <h2 className={styles.name}>{product.name}</h2>
      <p className={styles.price}>{Number(product.price).toLocaleString()}원</p>
      <p className={styles.desc}>{product.info}</p>
      <p className={styles.type}>판매 방식: {product.type}</p>
      {product.reserve_end !== '0' && (
        <p className={styles.reserveEnd}>예약 마감: {product.reserve_end}</p>
      )}

      <button className={styles.chatButton}>채팅하기</button>
    </div>
  );
};

export default MenuDetail;

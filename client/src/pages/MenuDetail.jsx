import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MenuDetail.module.css';
const API_URL = process.env.REACT_APP_API_URL;

const MenuDetail = () => {
  const { menuId } = useParams(); // menuId = item_id
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${menuId}`);

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

  // 장바구니 개수 업데이트 이벤트 발송 함수
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // 커스텀 이벤트로 네비게이션바에 알림
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { count: totalCount }
    }));
  };

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

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const addToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      const cartItem = {
        productId: product.id || menuId,
        name: product.name, // 메뉴 이름만 저장
        price: product.price,
        quantity: quantity,
        image: product.images?.[0] || null,
        sellerId: product.user_id,
        type: product.type,
        addedAt: new Date().toISOString()
      };

      // 로컬스토리지에서 기존 장바구니 가져오기
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = existingCart.findIndex(item => item.productId === cartItem.productId);

      if (existingItemIndex !== -1) {
        // 이미 있는 상품이면 수량 추가
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        // 새 상품이면 추가
        existingCart.push(cartItem);
      }

      // 로컬스토리지에 저장
      localStorage.setItem('cart', JSON.stringify(existingCart));

      // 장바구니 개수 업데이트 이벤트 발송
      updateCartCount();

      // 성공 메시지 표시
      alert(`${product.name}이(가) 장바구니에 추가되었습니다!`);

      // 수량을 1로 리셋
      setQuantity(1);

    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      alert('장바구니 추가에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 장바구니로 이동
  const goToCart = () => {
    navigate('/cart');
  };

  // 판매자와 채팅하기
  const chatWithSeller = () => {
    navigate(`/chat/${product.user_id}`);
  };

  if (loading) return <div className={styles.wrapper}>로딩 중...</div>;
  if (error) return <div className={styles.wrapper}>에러: {error}</div>;
  if (!product) return <div className={styles.wrapper}>메뉴를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          &lt; 뒤로가기
        </button>
        <button onClick={goToCart} className={styles.cartIconButton}>
          🛒
        </button>
      </div>

      <div className={styles.imageBox}>
        {product.images && product.images.length > 0 ? (
          <div style={{ position: 'relative' }}>
            <img
              src={`${product.images[currentImageIndex]}`}
              alt={`${product.name} ${currentImageIndex + 1}`}
              className={styles.mainImage}
            />

            {/* 이미지가 2개 이상일 때만 버튼 표시 */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className={`${styles.navButton} ${styles.navPrev}`}
                >
                  &#8249;
                </button>

                <button
                  onClick={nextImage}
                  className={`${styles.navButton} ${styles.navNext}`}
                >
                  &#8250;
                </button>

                {/* 이미지 인디케이터 (점) */}
                <div className={styles.indicatorContainer}>
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`${styles.indicatorDot} ${index === currentImageIndex ? styles.activeDot : ''}`}
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

      <div className={styles.productInfo}>
        <h2 className={styles.name}>{product.name}</h2>
        <p className={styles.price}>{Number(product.price).toLocaleString()}원</p>
        <p className={styles.desc}>{product.info}</p>
        <p className={styles.type}>판매 방식: {product.type}</p>
        {product.reserve_end !== '0' && (
          <p className={styles.reserveEnd}>예약 마감: {product.reserve_end}</p>
        )}
      </div>

      {/* 수량 선택 및 총 가격 */}
      <div className={styles.quantityWrapper}>
        <div className={styles.quntitySection}>
          <span className={styles.quantityLabel}>수량:</span>
          <div className={styles.quantityControls}>
            <button
              onClick={() => handleQuantityChange(-1)}
              className={styles.quantityButton}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className={styles.quantity}>{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className={styles.quantityButton}
            >
              +
            </button>
          </div>
        </div>
        <div className={styles.totalPrice}>
          총 {Number(product.price * quantity).toLocaleString()}원
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className={styles.buttonSection}>
        <button
          className={styles.cartButton}
          onClick={addToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? '추가 중...' : '장바구니 담기'}
        </button>
        <button
          className={styles.chatButton}
          onClick={chatWithSeller}
        >
          채팅하기
        </button>
      </div>
    </div>
  );
};

export default MenuDetail;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Cart.module.css';
const API_URL = process.env.REACT_APP_API_URL;

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const [sellerInfo, setSellerInfo] = useState({});
  const [loading, setLoading] = useState(true);

  // 판매자 정보 가져오기
  const fetchSellerInfo = async (sellerId) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${sellerId}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error(`판매자 ${sellerId} 정보 로드 실패:`, error);
    }
    return { nickname: `판매자 ${sellerId}` }; // 기본값
  };

  // 모든 판매자 정보 가져오기
  const fetchAllSellerInfo = async (sellerIds) => {
    const sellerInfoMap = {};
    for (const sellerId of sellerIds) {
      const info = await fetchSellerInfo(sellerId);
      sellerInfoMap[sellerId] = info;
    }
    return sellerInfoMap;
  };

  // 장바구니 개수 업데이트 이벤트 발송
  const updateCartCount = () => {
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { count: totalCount } 
    }));
  };

  // 판매자별로 상품 그룹화
  const groupItemsBySeller = (items) => {
    const grouped = {};
    items.forEach(item => {
      const sellerId = item.sellerId;
      if (!grouped[sellerId]) {
        grouped[sellerId] = [];
      }
      grouped[sellerId].push(item);
    });
    return grouped;
  };

  // 장바구니 데이터 로드
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          const grouped = groupItemsBySeller(parsedCart);
          const sellerIds = Object.keys(grouped);
          
          // 판매자 정보들을 병렬로 가져오기
          const sellerInfoMap = await fetchAllSellerInfo(sellerIds);
          
          setCartItems(parsedCart);
          setGroupedItems(grouped);
          setSellerInfo(sellerInfoMap);
        }
      } catch (error) {
        console.error('장바구니 데이터 로드 실패:', error);
        localStorage.removeItem('cart');
      } finally {
        setLoading(false);
      }
    };

    loadCartItems();
  }, []);

  // 로컬스토리지 업데이트 및 이벤트 발송
  const saveCartToStorage = (updatedCart) => {
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    setGroupedItems(groupItemsBySeller(updatedCart));
    
    // 카운트 업데이트 이벤트 발송
    const totalCount = updatedCart.reduce((sum, item) => sum + item.quantity, 0);
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { count: totalCount } 
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    
    saveCartToStorage(updatedCart);
  };

  const handleRemoveItem = (productId, productName) => {
    if (window.confirm(`${productName}을(를) 장바구니에서 제거하시겠습니까?`)) {
      const updatedCart = cartItems.filter(item => item.productId !== productId);
      saveCartToStorage(updatedCart);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('장바구니를 비우시겠습니까?')) {
      saveCartToStorage([]);
    }
  };

  // 판매자별 총 가격 계산
  const getSellerTotalPrice = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // 전체 총 가격 계산
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // 전체 상품 개수
  const getCartCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // 판매자와 채팅하기
  const handleChatWithSeller = (sellerId) => {
    navigate(`/chat/${sellerId}`);
  };

  if (loading) {
    return <div className={styles.wrapper}>로딩 중...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            ← 뒤로가기
          </button>
          <h1 className={styles.title}>장바구니</h1>
        </div>
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>🛒</div>
          <p className={styles.emptyText}>장바구니가 비어있습니다</p>
          <button 
            onClick={() => navigate('/home')} 
            className={styles.shopButton}
          >
            쇼핑하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← 뒤로가기
        </button>
        <h1 className={styles.title}>장바구니 ({getCartCount()})</h1>
        <button onClick={handleClearCart} className={styles.clearButton}>
          전체삭제
        </button>
      </div>

      <div className={styles.cartList}>
        {Object.entries(groupedItems).map(([sellerId, items]) => (
          <div key={sellerId} className={styles.sellerGroup}>
            {/* 판매자 헤더 */}
            <div className={styles.sellerHeader}>
              <div className={styles.sellerInfo}>
                <h3 className={styles.sellerName}>
                  {sellerInfo[sellerId]?.nickname || `판매자 ${sellerId}`}
                </h3>
                <span className={styles.itemCount}>
                  {items.length}개 상품 • {getSellerTotalPrice(items).toLocaleString()}원
                </span>
              </div>
              <button 
                onClick={() => handleChatWithSeller(sellerId)}
                className={styles.chatButton}
              >
                채팅하기
              </button>
            </div>

            {/* 해당 판매자의 상품들 */}
            <div className={styles.sellerItems}>
              {items.map((item) => (
                <div key={item.productId} className={styles.cartItem}>
                  <div className={styles.itemImage}>
                    {item.image ? (
                      <img 
                        src={`${API_URL}${item.image}`} 
                        alt={item.name}
                        className={styles.productImage}
                      />
                    ) : (
                      <div className={styles.noImage}>이미지 없음</div>
                    )}
                  </div>

                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <p className={styles.itemPrice}>{Number(item.price).toLocaleString()}원</p>
                    <p className={styles.itemType}>판매방식: {item.type}</p>
                    
                    <div className={styles.quantityControls}>
                      <button 
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className={styles.quantityButton}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className={styles.quantityButton}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <div className={styles.itemTotal}>
                      {Number(item.price * item.quantity).toLocaleString()}원
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.productId, item.name)}
                      className={styles.removeButton}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cart;
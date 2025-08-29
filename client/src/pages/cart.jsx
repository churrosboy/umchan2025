import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Cart.module.css';
const API_URL = process.env.REACT_APP_API_URL;

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);


  // 장바구니 개수 업데이트 이벤트 발송
  const updateCartCount = () => {
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { count: totalCount } 
    }));
  };

  // 장바구니 데이터 로드
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
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

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }
    // 주문 페이지로 이동
    navigate('/order', { 
      state: { 
        items: cartItems, 
        totalPrice: getTotalPrice(),
        orderType: 'cart' // 장바구니 주문 구분
      } 
    });
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
        {cartItems.map((item) => (
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
              <h3 className={styles.itemName}>{item.name}</h3>
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

      <div className={styles.cartSummary}>
        <div className={styles.totalSection}>
          <div className={styles.totalRow}>
            <span>상품금액</span>
            <span>{getTotalPrice().toLocaleString()}원</span>
          </div>
          <div className={styles.totalRow}>
            <span>배송비</span>
            <span>0원</span>
          </div>
          <div className={styles.totalRowFinal}>
            <span>총 결제금액</span>
            <span>{getTotalPrice().toLocaleString()}원</span>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button 
            onClick={() => navigate('/home')}
            className={styles.continueShoppingButton}
          >
            계속 쇼핑하기
          </button>
          <button 
            onClick={handleCheckout}
            className={styles.checkoutButton}
          >
            주문하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
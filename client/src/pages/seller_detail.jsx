import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/SellerDetail.module.css';

const SellerDetail = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, productRes] = await Promise.all([
          fetch(`http://localhost:4000/api/users/${sellerId}`),
          fetch(`http://localhost:4000/api/products/user/${sellerId}`)
        ]);
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setSeller(userData);
        }
        
        if (productRes.ok) {
          const productData = await productRes.json();
          setProducts(productData);
        }
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [sellerId]);

  if (loading) return <div>로딩 중...</div>;
  if (!seller) return <div>판매자를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrapper}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        &lt; 뒤로가기
      </button>

      <h2 onClick={() => navigate(`/other_user_profile/${seller.id}`)}>{seller.nickname}</h2>
      <p className={styles.info}>
        ⭐ {seller.avg_rating} ({seller.review_cnt}) 💚 {seller.like_cnt}
      </p>

      <h3 className={styles.sectionTitle}>즉시구매 상품</h3>
      {products.filter(product => product.type === '즉시').map(product => (
        <div
          key={product.item_id}
          className={styles.menuCard}
          onClick={() => navigate(`/menu/${product.item_id}`)}
        >
          <strong>{product.name}</strong>
          <p>{product.info}</p>
          <p>{product.price}원</p>
        </div>
      ))}

      <h3 className={styles.sectionTitle}>예약구매 상품</h3>
      {products.filter(product => product.type === '예약').map(product => (
        <div
          key={product.item_id}
          className={styles.menuCard}
          onClick={() => navigate(`/menu/${product.item_id}`)}
        >
          <strong>{product.name}</strong>
          <p>{product.info}</p>
          <p>{product.price}원</p>
        </div>
      ))}
    </div>
  );
};

export default SellerDetail;

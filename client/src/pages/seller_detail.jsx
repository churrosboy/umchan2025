import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactComponent as Star } from '../Icons/Star01.svg';
import { ReactComponent as Heart } from '../Icons/Heart01.svg';
import styles from '../styles/SellerDetail.module.css'; //스타일 가져오는 부분

const SellerDetail = () => {
  const { sellerId } = useParams(); //홈화면에서 선택된 판매자의 Id를 가져오는 부분
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null); //sellers 데이터에서 sellerId와 일치하는 데이터를 seller에 저장
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
      {/*뒤로가기 버튼*/}
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        &lt; 뒤로가기
      </button>

      <h2 onClick={() => navigate(`/other_user_profile/${seller.id}`)}>{seller.nickname}</h2>
      <p className={styles.info}>
        <Star width={17} height={17} style={{ verticalAlign: 'middle' }}/> 
        {seller.avg_rating} ({seller.review_cnt})
        <Heart width={19} height={19} style={{ verticalAlign: 'middle' }}/>
        {seller.like_cnt}
      </p>

      {/*즉시구매 상품란/sellingType에 따라 표시되는 상품 구분*/}
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

      {/*예약구매 상품란*/}
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

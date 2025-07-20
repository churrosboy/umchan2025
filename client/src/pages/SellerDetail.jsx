import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';
import styles from '../styles/SellerDetail.module.css';

const SellerDetail = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const seller = sellers.find(s => s.id === Number(sellerId));

  if (!seller) return <div>판매자를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrapper}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        &lt; 뒤로가기
      </button>

      <h2 onClick={() => navigate(`/other_user_profile/${seller.id}`)}>{seller.name}</h2>
      <p className={styles.info}>
        ⭐ {seller.rating} ({seller.reviews}) 💚 {seller.hearts}
      </p>

      <div className={styles.mapBox}>지도 삽입</div>

      <h3 className={styles.sectionTitle}>즉시구매 상품</h3>
      {seller.sellingType === 'immediate' &&
        seller.menus.map(menu => (
          <div
            key={menu.id}
            className={styles.menuCard}
            onClick={() => navigate(`/menu/${menu.id}`)}
          >
            <strong>{menu.name}</strong>
            <p>{menu.desc}</p>
          </div>
        ))}

      <h3 className={styles.sectionTitle}>예약구매 상품</h3>
      {seller.sellingType === 'reservation' &&
        seller.menus.map(menu => (
          <div
            key={menu.id}
            className={styles.menuCard}
            onClick={() => navigate(`/menu/${menu.id}`)}
          >
            <strong>{menu.name}</strong>
            <p>{menu.desc}</p>
          </div>
        ))}
    </div>
  );
};

export default SellerDetail;

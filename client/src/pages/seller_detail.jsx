import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';  //나중에 users에 담겨있을 내용들
import styles from '../styles/SellerDetail.module.css'; //스타일 가져오는 부분

const SellerDetail = () => {
  const { sellerId } = useParams(); //홈화면에서 선택된 판매자의 Id를 가져오는 부분
  const navigate = useNavigate();
  const seller = sellers.find(s => s.id === Number(sellerId));  //sellers 데이터에서 sellerId와 일치하는 데이터를 seller에 저장

  if (!seller) return <div>판매자를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrapper}>
      {/*뒤로가기 버튼*/}
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        &lt; 뒤로가기
      </button>

      {/*판매자 닉네임 부분. 클릭 시 판매자의 프로필로 이동.*/}
      <h2 onClick={() => navigate(`/other_user_profile/${seller.id}`)}>{seller.name}</h2>
      <p className={styles.info}>
        ⭐ {seller.rating} ({seller.reviews}) 💚 {seller.hearts}
      </p>

      {/*즉시구매 상품란/sellingType에 따라 표시되는 상품 구분*/}
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

      {/*예약구매 상품란*/}
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

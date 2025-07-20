import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';
import styles from '../styles/MenuDetail.module.css';

const MenuDetail = () => {
  const { menuId } = useParams();
  const navigate = useNavigate();

  let menu = null;
  sellers.forEach(s => {
    s.menus.forEach(m => {
      if (m.id === Number(menuId)) menu = m;
    });
  });

  if (!menu) return <div>메뉴를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrapper}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        &lt; 뒤로가기
      </button>

      <div className={styles.imageBox}>상세사진 영역</div>

      <h2 className={styles.name}>{menu.name}</h2>
      <p className={styles.price}>{menu.price.toLocaleString()}원</p>
      <p className={styles.desc}>{menu.desc}</p>

      <button className={styles.chatButton}>채팅하기</button>
    </div>
  );
};

export default MenuDetail;

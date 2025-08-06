import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';  //나중에는 users에서 관리할 데이터
import styles from '../styles/MenuDetail.module.css'; //스타일을 불러오는 부분

const MenuDetail = () => {
  const { menuId } = useParams(); //이전 화면에서 선택된 메뉴Id를 가져오는 부분
  const navigate = useNavigate();

  let menu = null;  //메뉴 데이터를 받아놓을 변수
  sellers.forEach(s => {  //sellers의 데이터에서 메뉴의 데이터 가져오는 함수 -> menu에 저장
    s.menus.forEach(m => {
      if (m.id === Number(menuId)) menu = m;
    });
  });

  // menu에 저장된거 없으면 메뉴 없음
  if (!menu) return <div>메뉴를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrapper}>
      {/*뒤로가기 버튼*/}
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        &lt; 뒤로가기
      </button>

      {/*메뉴 이미지*/}
      <div className={styles.imageBox}>상세사진 영역</div>

      {/*메뉴 정보란*/}
      <h2 className={styles.name}>{menu.name}</h2>
      <p className={styles.price}>{menu.price.toLocaleString()}원</p>
      <p className={styles.desc}>{menu.desc}</p>

      {/*채팅하기 버튼*/}
      <button className={styles.chatButton}>채팅하기</button>
    </div>
  );
};

{/*스타일은 styles 폴더의 MenuDetail.module.css 파일 확인*/}
export default MenuDetail;

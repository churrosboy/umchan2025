import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../../data/sellers';
import styles from './SellerAuth.module.css';

const SellerAuth = () => {
  const { userId } = useParams(); //userId를 받아오는 부분
  const user = sellers.find(u => u.id === Number(userId));    //userId를 통해 유저 정보를 저장하는 부분
  const navigate = useNavigate();

  //뒤로가기 함수
  const goBack = () => {
    navigate(-1);
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.backButton}><span onClick={goBack}>←</span></div>
          <div style={styles.headerTitle}>판매자 인증정보</div>
          <div style={{ width: 18 }} />
        </div>
        <div style={styles.scrollArea}>
          <div style={styles.section}>
            <div style={styles.infoBox}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: 30, marginRight: 12 }}>🧑‍🍳</div>
                <div>
                  <div style={styles.sectionTitle}>{user.name} 님의 판매자 인증정보</div>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    사업자 인증<br />위생점검
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ ...styles.infoBox, fontSize: 13, color: '#444' }}>
            먼저 방문해서 확인했어요.<br />
            정기 위생 교육을 이수했어요.<br />
            실제 등록된 사업자로 인증했어요.<br />
            공용 공간이 아닌 별도 주방이에요.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAuth;
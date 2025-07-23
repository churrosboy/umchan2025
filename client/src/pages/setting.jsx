import React from 'react';
import { useNavigate } from 'react-router-dom';

const Setting = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    }

    return (
        <div style={styles.wrapper}>
          <div style={styles.container}>
            <div style={styles.backButton}><span onClick={goBack}>
                &lt; 뒤로가기
            </span></div>
            <button style={styles.button}>프로필 수정</button>
            <button style={styles.button}>계정 관리</button>
            <button style={styles.button}>알림설정</button>
            <button style={styles.button}>채팅설정</button>
            <button style={styles.button}>앱 설정</button>
            <div style={styles.margin}></div>
            <button style={styles.button} onClick={() => navigate(`/`)}>로그아웃</button>
            <button style={styles.button}>탈퇴하기</button>
          </div>
        </div>
    );
};

const styles = {
  wrapper: {
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'start',
    padding: '40px 0',
    boxSizing: 'border-box',
    fontFamily: 'Roboto, sans-serif'
  },
  container: {
    width: '100%',
    maxWidth: '375px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  backButton: {
        cursor: 'pointer',
        fontSize: 18,
        color: '#333',
  },
  button: {
    backgroundColor: '#FFD856',
    borderRadius: '15px',
    position: 'relative',
    padding: '12px 40px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none'
  },
  buttonText: {
    display: 'block'
  },
  margin: {
    padding: '40px'
  }
};

export default Setting;

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { users } from '../data/users';

const Setting = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const user = users.find(u => u.id === Number(userId));

    const goBack = () => {
        navigate(-1);
    }

    const goToUpdateProfile = () => {
      navigate('/UpdateProfile/' + userId);
    }

    return (
        <div style={styles.wrapper}>
          <div style={styles.container}>
            <div style={styles.backButton}><span onClick={goBack}>
                &lt; 뒤로가기
            </span></div>
            <button style={styles.button} onClick={goToUpdateProfile}>프로필 수정</button>
            <button style={styles.button}>계정 관리</button>
            <button style={styles.button}>알림설정</button>
            <button style={styles.button}>채팅설정</button>
            <button style={styles.button}>앱 설정</button>
            <div style={styles.margin}></div>
            <button style={styles.button} onClick={() => navigate(`/`)}>로그아웃</button>
            <button style={styles.button}>탈퇴하기</button>
            <div style={styles.margin}></div>
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
    boxSizing: 'border-box',
    fontFamily: 'Roboto, sans-serif'
  },
  container: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: '16px',
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
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
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
    padding: '20px'
  }
};

export default Setting;

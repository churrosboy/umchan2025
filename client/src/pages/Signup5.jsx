import React from 'react';
import { useNavigate } from 'react-router-dom';

const Signup5 = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/');
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>🎉 회원가입이 완료되었습니다!</h2>
        <button style={styles.button} onClick={goToLogin}>로그인 하러 가기</button>
      </div>
    </div>
  );
};


const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    width: '90%',
    maxWidth: '360px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    padding: '40px 20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '22px',
    marginBottom: '20px',
    color: '#333',
  },
  text: {
    fontSize: '16px',
    marginBottom: '30px',
    color: '#555',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#fcd265',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
  },
};

export default Signup5;
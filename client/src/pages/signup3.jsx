import React from 'react';
import { useNavigate } from 'react-router-dom';

const Signup3 = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/signup4');
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>✅ 본인인증을 진행해주세요</h2>
        <input style={styles.input} type="text" placeholder="휴대폰 번호" />
        <button style={styles.button}>인증번호 받기</button>
        <input style={styles.input} type="text" placeholder="인증번호 입력" />
        <button style={styles.button} onClick={handleNext}>다음</button>
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
    marginBottom: '30px',
    color: '#333',
  },
  input: {
    width: '90%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    fontSize: '14px',
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
    marginBottom: '10px',
  },
};

export default Signup3;

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Signup2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, email } = location.state || {}; // 이전 페이지 데이터 받기

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = () => {
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    // 이전 데이터와 현재 데이터를 합쳐서 다음 페이지로 전달
    navigate('/signup3', { state: { name, email, password } });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>🙈 비밀번호를 설정해주세요</h2>
        <input
          style={styles.input}
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
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
  },
};

export default Signup2;
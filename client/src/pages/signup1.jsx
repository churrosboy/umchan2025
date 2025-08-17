import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup1 = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleNext = () => {
    if (!name || !email) {
      alert('이름과 이메일을 모두 입력해주세요.');
      return;
    }
    // 다음 페이지로 state를 통해 데이터 전달
    navigate('/signup2', { state: { name, email } });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>✏️ 회원정보를 입력해 주세요</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          style={styles.input}
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

export default Signup1;
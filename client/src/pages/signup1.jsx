import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '../styles/commonStyles';

const Signup1 = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleNext = () => {
    if (!name || !email) {
      alert('이름과 이메일을 모두 입력해주세요.');
      return;
    }
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
  ...commonStyles,
};

export default Signup1;
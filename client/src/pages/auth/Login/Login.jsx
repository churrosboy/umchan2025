import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';

import { commonStyles } from '../../../styles/commonStyles';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const goToSignup = () => {
    navigate('/signup1');
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (error) {
      alert('로그인 실패');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>엄마찬스에 로그인하기</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={styles.button} onClick={handleLogin}>로그인</button>
        <p style={styles.signupText}>
          계정이 없으신가요? <span onClick={goToSignup} style={styles.link}>회원가입</span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  ...commonStyles,
  signupText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#fca311',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Login;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css'; // ✅ 모듈 스타일 import

const Login = () => {
  const navigate = useNavigate();

  const goToSignup = () => {
    navigate('/signup1');
  };

  const handleLogin = () => {
    navigate('/home');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>엄마찬스에 로그인하기</h2>
        <input className={styles.input} type="text" placeholder="이메일" />
        <input className={styles.input} type="password" placeholder="비밀번호" />
        <button className={styles.button} onClick={handleLogin}>로그인</button>
        <p className={styles.signupText}>
          계정이 없으신가요? <span onClick={goToSignup} className={styles.link}>회원가입</span>
        </p>
      </div>
    </div>
  );
};

export default Login;

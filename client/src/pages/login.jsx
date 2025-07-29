import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
  const navigate = useNavigate();

  const goToSignup = () => {
    navigate('/signup1');
  };

  const handleLogin = async() => {
    const email = document.querySelector('input[type="text"]').value;
    const password = document.querySelector('input[type="password"]').value;
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (error) {
      alert('로그인 실패: ' + error.message);
    }    
  
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

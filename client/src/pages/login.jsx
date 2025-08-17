import React, { useState } from 'react'; // useState를 import 합니다.
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
  const navigate = useNavigate();
  // 이메일과 비밀번호를 관리할 state 변수를 생성합니다.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 회원가입 화면으로 이동하는 함수
  const goToSignup = () => {
    navigate('/signup1');
  };

  // 로그인 로직을 처리하는 함수
  const handleLogin = async () => {
    // state에 저장된 이메일과 비밀번호를 사용합니다.
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // 로그인 성공 시에만 홈으로 이동합니다.
      navigate('/home');
    } catch (error) {
      // 실패 시 에러 메시지를 보여주고 화면은 그대로 유지합니다.
      alert('로그인 실패: ' + error.message);
    }
  };

  // 화면
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>엄마찬스에 로그인하기</h2>
        {/* 이메일 입력란: state와 연결 */}
        <input
          className={styles.input}
          type="text"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* 비밀번호 입력란: state와 연결 */}
        <input
          className={styles.input}
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className={styles.button} onClick={handleLogin}>로그인</button>
        <p className={styles.signupText}>
          계정이 없으신가요? <span onClick={goToSignup} className={styles.link}>회원가입</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
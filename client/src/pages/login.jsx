import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
  const navigate = useNavigate();

  {/*회원가입 화면으로 이동하는 함수 */}
  const goToSignup = () => {
    navigate('/signup1'); {/*App.jsx 가보면 '/signup1' 같은거 어떤 페이지 뜨게하는건지 나와있음*/}
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
  
    navigate('/home');
  };

  {/*화면*/}
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>엄마찬스에 로그인하기</h2> {/*제목*/}
        <input className={styles.input} type="text" placeholder="이메일" /> {/*이메일 입력란*/}
        <input className={styles.input} type="password" placeholder="비밀번호" /> {/*비밀번호 입련란*/}
        <button className={styles.button} onClick={handleLogin}>로그인</button> {/*로그인 버튼*/}
        <p className={styles.signupText}>
          계정이 없으신가요? <span onClick={goToSignup} className={styles.link}>회원가입</span> {/*회원가입 텍스트, 회원가입 화면 이동*/}
        </p>
      </div>
    </div>
  );
};

export default Login;

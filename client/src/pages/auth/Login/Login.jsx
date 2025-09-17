import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';

import '../../../styles/commonStyles.css';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const goToSignup = () => {
    navigate('/signup/email');
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
    <div className="wrapper">
      <div className="container">
        <h2 className="title">엄마찬스에 로그인하기</h2>
        <input
          className="input"
          type="text"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="button" onClick={handleLogin}>로그인</button>
        <p className={styles.signupText}>
          계정이 없으신가요? <span onClick={goToSignup} className={styles.link}>회원가입</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
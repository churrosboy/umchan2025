import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

import { commonStyles } from '../styles/commonStyles';

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  import.meta?.env?.VITE_API_BASE ||
  '';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const goToSignup = () => {
    navigate('/signup1');
  };

  // 사용자 프로필 완성도 체크
  const checkProfileComplete = async (uid) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/profile-status?uid=${uid}`);
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.isProfileComplete || false;
    } catch (error) {
      console.error('프로필 상태 확인 실패:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // Firebase 로그인
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 프로필 완성도 체크
      const isProfileComplete = await checkProfileComplete(user.uid);

      if (isProfileComplete) {
        // 프로필이 완성된 경우 홈으로
        navigate('/home', { replace: true });
      } else {
        // 프로필이 미완성인 경우 초기 프로필 설정으로
        navigate('/initial-profile', { replace: true });
      }

    } catch (error) {
      console.error('로그인 실패:', error);
      
      let errorMessage = '로그인에 실패했습니다.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = '존재하지 않는 이메일입니다.';
          break;
        case 'auth/wrong-password':
          errorMessage = '비밀번호가 틀렸습니다.';
          break;
        case 'auth/invalid-email':
          errorMessage = '올바른 이메일 형식이 아닙니다.';
          break;
        case 'auth/user-disabled':
          errorMessage = '비활성화된 계정입니다.';
          break;
        case 'auth/too-many-requests':
          errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
          break;
        default:
          errorMessage = '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>엄마찬스에 로그인하기</h2>
        
        <input
          style={styles.input}
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        
        <input
          style={styles.input}
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        
        <button 
          style={{
            ...styles.button,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }} 
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
        
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
    textDecoration: 'underline',
  },
};

export default Login;
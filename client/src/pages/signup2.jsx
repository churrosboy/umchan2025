import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// 1. 아이콘을 SVG 컴포넌트로 분리하여 재사용
const EyeIcon = ({ isVisible }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ width: '22px', height: '22px', color: '#888' }}
  >
    {isVisible ? (
      // 눈 모양 (숨기기) 아이콘
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    ) : (
      // 눈에 슬래시 (보이기) 아이콘
      <path
        fillRule="evenodd"
        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.974 0 9.19 3.226 10.678 7.697a.75.75 0 010 .606C21.19 17.024 16.973 20.25 12.001 20.25c-4.974 0-9.19-3.226-10.678-7.697a.75.75 0 010-.606zM12 15a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    )}
    {isVisible && (
      <path
        fillRule="evenodd"
        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.974 0 9.19 3.226 10.678 7.697a.75.75 0 010 .606C21.19 17.024 16.973 20.25 12.001 20.25c-4.974 0-9.19-3.226-10.678-7.697a.75.75 0 010-.606z"
        clipRule="evenodd"
        opacity="0.3"
      />
    )}
  </svg>
);


const Signup2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { name, email } = location.state || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleNext = () => {
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    navigate('/signup3', { state: { name, email, password } });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>{
          showPassword ? '🙉' : '🙈'} 비밀번호를 설정해주세요
        </h2>
        
        <div style={styles.inputContainer}>
          <input
            style={styles.input}
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={togglePasswordVisibility} style={styles.toggleButton}>
            {/* 2. 이모지 대신 아이콘 컴포넌트 사용 */}
            <EyeIcon isVisible={showPassword} />
          </button>
        </div>

        <div style={styles.inputContainer}>
          <input
            style={styles.input}
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={togglePasswordVisibility} style={styles.toggleButton}>
            {/* 2. 이모지 대신 아이콘 컴포넌트 사용 */}
            <EyeIcon isVisible={showPassword} />
          </button>
        </div>
        
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
    inputContainer: {
      position: 'relative',
      width: '100%',
      marginBottom: '15px',
    },
    input: {
      width: '100%',
      padding: '12px 45px 12px 12px', // 오른쪽 패딩을 아이콘 너비에 맞게 조정
      border: '1px solid #ccc',
      borderRadius: '10px',
      fontSize: '14px',
      boxSizing: 'border-box',
    },
    toggleButton: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0', // 버튼 자체의 패딩은 제거
      display: 'flex',
      alignItems: 'center',
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
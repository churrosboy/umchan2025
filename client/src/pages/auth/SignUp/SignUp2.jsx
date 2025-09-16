import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { commonStyles } from '../../../styles/commonStyles';

import eyeOpenIcon from '../../../Icons/See.svg';
import eyeClosedIcon from '../../../Icons/Hide.svg';

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
    if (password.length < 6) {
      alert('비밀번호는 6자리 이상이어야 합니다.');
      return;
    }
    navigate('/signup3', { state: { name, email, password } });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>
          {showPassword ? '🙉' : '🙈'} 비밀번호를 설정해주세요
        </h2>
        <div style={styles.inputContainer}>
          <input
            style={styles.input}
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => setShowPassword(!showPassword)} style={styles.toggleButton}>
            <img
              src={showPassword ? eyeClosedIcon : eyeOpenIcon}
              alt="비밀번호 보기"
              style={{ width: '22px' }}
            />
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
        </div>
        <button style={styles.button} onClick={handleNext}>다음</button>
      </div>
    </div>
  );
};

const styles = {
  ...commonStyles,
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: { // 공통 input 스타일을 덮어쓰기
    ...commonStyles.input,
    paddingRight: '45px',
  },
  toggleButton: {
    position: 'absolute',
    right: '10px',
    top: '15px', // input의 padding과 맞춤
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
};

export default Signup2;
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import '../../../styles/commonStyles.css';
import styles from './SignUp.module.css';

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
    navigate('/signup/phone', { state: { name, email, password } });
  };

  return (
    <div className="wrapper">
      <div className="container">
        <h2 className="title">
          {showPassword ? '🙉' : '🙈'} 비밀번호를 설정해주세요
        </h2>
        <div className={styles.inputContainer}>
          <input
            className="input"
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ paddingRight: '45px' }}
          />
          <button onClick={() => setShowPassword(!showPassword)} className={styles.toggleButton}>
            <img
              src={showPassword ? eyeClosedIcon : eyeOpenIcon}
              alt="비밀번호 보기"
              style={{ width: '22px' }}
            />
          </button>
        </div>
        <div className={styles.inputContainer}>
          <input
            className="input"
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ paddingRight: '45px' }}
          />
        </div>
        <button className="button" onClick={handleNext}>다음</button>
      </div>
    </div>
  );
};

export default Signup2;
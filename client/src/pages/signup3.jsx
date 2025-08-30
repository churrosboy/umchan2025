import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { commonStyles } from '../styles/commonStyles';
// Firebase auth import
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// 중요: Firebase 설정 파일을 import 해야 합니다.
// 프로젝트의 firebase.js 또는 firebaseConfig.js 파일 경로에 맞게 수정해주세요.
import { auth } from '../firebase'; 

const Signup3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevData = location.state || {};

  const [phone, setPhone] = useState({ part1: '', part2: '', part3: '' });
  const inputRef2 = useRef(null);
  const inputRef3 = useRef(null);
  
  // --- 추가된 State ---
  const [isCodeSent, setIsCodeSent] = useState(false); // 인증번호 발송 여부
  const [verificationCode, setVerificationCode] = useState(''); // 사용자가 입력한 인증번호
  const [confirmationResult, setConfirmationResult] = useState(null); // Firebase 인증 결과 객체

  // --- Firebase reCAPTCHA 설정 ---
  useEffect(() => {
    // reCAPTCHA를 보이지 않게 설정하고, 인증 요청 시 자동으로 검증을 수행합니다.
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA가 성공적으로 검증됨
        console.log("reCAPTCHA verified");
      }
    });
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^0-9]/g, '');

    setPhone((prev) => ({ ...prev, [name]: sanitizedValue }));

    if (name === 'part1' && sanitizedValue.length === 3) inputRef2.current.focus();
    if (name === 'part2' && sanitizedValue.length === 4) inputRef3.current.focus();
  };
  
  // --- 기존 handleNext를 수정하여 인증번호를 발송하는 함수 ---
  const handleSendCode = async () => {
    const { part1, part2, part3 } = phone;
    if (part1.length < 3 || part2.length < 3 || part3.length < 4) {
      alert('휴대폰 번호를 올바르게 입력해주세요.');
      return;
    }
    // Firebase는 국제 표준 번호 형식(E.164)을 요구합니다. (예: +821012345678)
    const fullPhone = `+82${part1.substring(1)}${part2}${part3}`;
    const appVerifier = window.recaptchaVerifier;

    try {
      const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmationResult(result);
      setIsCodeSent(true);
      alert('인증번호가 발송되었습니다.');
    } catch (error) {
      console.error("SMS 전송 오류:", error);
      alert('SMS 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      // 오류 발생 시 reCAPTCHA를 초기화해야 할 수 있습니다.
      appVerifier.clear()
    }
  };

  // --- 인증번호를 확인하고 다음 단계로 넘어가는 함수 ---
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      alert('인증번호 6자리를 정확하게 입력해주세요.');
      return;
    }
    try {
      await confirmationResult.confirm(verificationCode);
      // 인증 성공!
      const originalPhone = `${phone.part1}-${phone.part2}-${phone.part3}`;
      navigate('/signup4', { state: { ...prevData, phone: originalPhone } });

    } catch (error) {
      console.error("인증 오류:", error);
      alert('인증번호가 올바르지 않습니다.');
    }
  };


  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* UI를 인증번호 발송 전/후로 분기 처리 */}
        {!isCodeSent ? (
          <>
            <h2 style={styles.title}>📱 휴대폰 번호를 입력해주세요</h2>
            <div style={styles.phoneContainer}>
              <input name="part1" style={styles.phoneInput} type="tel" maxLength="3" value={phone.part1} onChange={handleChange} />
              <span style={styles.separator}>-</span>
              <input name="part2" ref={inputRef2} style={styles.phoneInput} type="tel" maxLength="4" value={phone.part2} onChange={handleChange} />
              <span style={styles.separator}>-</span>
              <input name="part3" ref={inputRef3} style={styles.phoneInput} type="tel" maxLength="4" value={phone.part3} onChange={handleChange} />
            </div>
            <button style={styles.button} onClick={handleSendCode}>인증번호 받기</button>
          </>
        ) : (
          <>
            <h2 style={styles.title}>✉️ 인증번호를 입력해주세요</h2>
            <p style={styles.infoText}>{`${phone.part1}-${phone.part2}-${phone.part3}`}으로 인증번호를 발송했습니다.</p>
            <input
              style={{...styles.phoneInput, width: '100%', marginBottom: '15px'}}
              type="tel"
              maxLength="6"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="인증번호 6자리"
            />
            <button style={styles.button} onClick={handleVerifyCode}>인증하고 다음으로</button>
          </>
        )}
      </div>
      {/* reCAPTCHA 위젯이 렌더링될 컨테이너 (보이지 않음) */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

const styles = {
  ...commonStyles,
  button: { ...commonStyles.button, marginTop: '15px' },
  phoneContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '15px',
  },
  phoneInput: {
    width: '25%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    fontSize: '16px',
    textAlign: 'center',
    boxSizing: 'border-box', // 너비 계산을 용이하게 하기 위해 추가
  },
  separator: {
    fontSize: '16px',
    color: '#333',
    fontWeight: 'bold',
  },
  // --- 추가된 스타일 ---
  infoText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },
};

export default Signup3;
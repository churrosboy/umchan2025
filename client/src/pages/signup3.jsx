import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import { auth } from '../firebase';
// import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const Signup3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevData = location.state || {}; // 이전 페이지 데이터 받기

  const [phone, setPhone] = useState('');

  const handleNext = () => {
    if (!phone) {
      alert('휴대폰 번호를 입력해주세요.');
      return;
    }
    // 모든 데이터를 합쳐서 다음 페이지로 전달
    navigate('/signup4', { state: { ...prevData, phone } });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>📱 휴대폰 번호를 입력해주세요</h2>
        <input
          name="phone"
          style={styles.input}
          type="text"
          placeholder="휴대폰 번호"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
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
  input: {
    width: '90%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    fontSize: '14px',
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
    marginBottom: '10px',
  },
};

export default Signup3;



  /*
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      // The 'sign-in-button' is the ID of the button that triggers the SMS sending
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber to proceed.
          // In this case, you can call the send code function again or
          // let the initial call proceed.
          console.log("reCAPTCHA solved");
        }
      });
    }
  }, []); // Empty dependency array ensures this runs only once
  

  const handleSendCode = async () => {
    const phoneNumber = document.querySelector('input[name="phone"]').value;
    // Use the verifier instance created in useEffect
    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      alert('인증번호가 전송되었습니다');
    } catch (error) {
      // Reset reCAPTCHA so user can try again
      appVerifier.render().then(widgetId => {
        window.grecaptcha.reset(widgetId);
      });
      alert('전송 실패: ' + error.message);
    }
  };
  

const handleVerifyCode = async () => {
  const code = document.querySelector('input[name="code"]').value;
  const phone = document.querySelector('input[name="phone"]').value;

  try {
    const result = await window.confirmationResult.confirm(code);
    const user = result.user;

    localStorage.setItem('phone', phone);
    alert('인증 성공!');
    navigate('/signup4');
  } catch (error) {
    alert('인증 실패: ' + error.message);
  }
};


  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>✅ 본인인증을 진행해주세요</h2>
        <input name="phone" style={styles.input} type="text" placeholder="휴대폰 번호" />
        <button id="sign-in-button" style={styles.button} onClick={handleSendCode}>인증번호 받기</button>
        <div id="recaptcha-container"></div>
        <input name="code" style={styles.input} type="text" placeholder="인증번호 입력" />
        <button style={styles.button} onClick={handleVerifyCode}>인증하기</button>
      </div>
    </div>
  );
  */
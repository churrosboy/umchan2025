import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Signup4 = () => {
  const navigate = useNavigate();

const handleSubmit = async () => {
  const email = localStorage.getItem('email');
  const password = localStorage.getItem('password');
  const phone = localStorage.getItem('phone');
  const address = document.querySelectorAll('input[type="text"]')[0].value;

  try {
    // 1. Firebase 계정 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // 2. MongoDB에 사용자 정보 저장
    await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        phone_number: phone,
        address
      }),
    });

    alert('🎉 회원가입이 완료되었습니다!');
    localStorage.clear();
    navigate('/');
  } catch (error) {
    alert('회원가입 실패: ' + error.message);
  }
};


  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>🏠 주소를 입력해주세요</h2>
        <input style={styles.input} type="text" placeholder="주소" />
        <button style={styles.button}>주소 찾기</button>
        <input style={styles.input} type="text" placeholder="상세 주소" />
        <button style={styles.button} onClick={handleSubmit}>회원가입</button>
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

export default Signup4;

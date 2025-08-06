import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 

const Signup4 = () => {
  const navigate = useNavigate();

const getCoordinatesFromAddress = async (address) => {
  console.log("📍 주소 변환 시작:", address);

  try {
    const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
    console.log("📦 응답 status:", response.status);

    const contentType = response.headers.get('content-type');
    console.log("📦 응답 Content-Type:", contentType);

    let data;

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log("📦 응답 데이터:", data);

      if (data.addresses && data.addresses.length > 0) {
        const { x, y } = data.addresses[0];
        return [parseFloat(x), parseFloat(y)];
      } else {
        throw new Error("❌ 주소 검색 결과 없음");
      }
    } else {
      const text = await response.text();
      try{
        data = JSON.parse(text);
      } catch (err){
        console.error("❌ JSON 파싱 실패:", text);
        throw new Error("서버 응답이 JSON이 아닙니다");
      }
    }
  } catch (err) {
    console.error("❌ fetch 실패:", err);
    throw new Error("좌표 요청 중 오류 발생");
  }
};

  const handleSubmit = async () => {
    const email = localStorage.getItem('email');
    const password = localStorage.getItem('password');
    const phone = localStorage.getItem('phone');
    const nickname = localStorage.getItem('nickname'); // 예: 닉네임도 입력 받았다면
    const address = document.querySelectorAll('input[type="text"]')[0].value;

    try {
      // 1. Firebase 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      console.log("checkpoint 1");
      // 2. 주소 → 좌표 변환
      const [longitude, latitude] = await getCoordinatesFromAddress(address);

      console.log("📍 fetch 요청 시작");

      // 3. MongoDB에 사용자 정보 저장
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: String(uid),
          nickname: String(nickname || ''),
          phone_number: String(phone),
          address: String(address),
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude)
        }),
      });

      console.log('📦 서버 응답 status:', response.status);

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
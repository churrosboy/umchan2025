import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Signup4 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 이전 모든 단계에서 취합된 데이터를 state에서 가져옴
  const { name, email, password, phone } = location.state || {};

  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const getCoordinatesFromAddress = async (fullAddress) => {
    console.log("📍 주소 변환 시작:", fullAddress);
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(fullAddress)}`);
      const data = await response.json();
      if (data.addresses && data.addresses.length > 0) {
        const { x, y } = data.addresses[0];
        return [parseFloat(x), parseFloat(y)];
      } else {
        throw new Error("주소 검색 결과가 없습니다.");
      }
    } catch (err) {
      console.error("❌ 주소 변환 실패:", err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!address) {
      alert('주소를 입력해주세요.');
      return;
    }

    const fullAddress = `${address} ${detailAddress}`;

    try {
      // 1. Firebase 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. 주소 → 좌표 변환
      const [longitude, latitude] = await getCoordinatesFromAddress(fullAddress);

      // 3. MongoDB에 사용자 정보 저장
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: String(uid),
          nickname: String(name), // name을 nickname으로 사용
          phone_number: String(phone),
          address: String(fullAddress),
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude),
        }),
      });

      if (!response.ok) {
        throw new Error('서버에 사용자 정보를 저장하는 데 실패했습니다.');
      }

      alert('🎉 회원가입이 완료되었습니다!');
      
      navigate('/');
    } catch (error) {
      alert('회원가입 실패: ' + error.message);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>🏠 주소를 입력해주세요</h2>
        <input
          style={styles.input}
          type="text"
          placeholder="주소"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button style={styles.button}>주소 찾기</button>
        <input
          style={styles.input}
          type="text"
          placeholder="상세 주소"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
        />
        <button style={styles.button} onClick={handleSubmit}>회원가입</button>
      </div>
    </div>
  );
};

// ... (styles 코드는 기존과 동일)
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
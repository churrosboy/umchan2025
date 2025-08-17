import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { commonStyles } from '../styles/commonStyles';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../firebase';

const Signup4 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevData = location.state || {};

  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        setPostcode(data.zonecode);
        setAddress(data.address);
        document.getElementById('detailAddress').focus();
      },
    }).open();
  };

  const handleSubmit = async () => {
    if (!address || !detailAddress) {
      alert('주소를 모두 입력해주세요.');
      return;
    }
    const finalData = { ...prevData, postcode, address, detailAddress };
    console.log('최종 가입 데이터:', finalData);
    alert('회원가입이 완료되었습니다!');
    // navigate('/home'); // 예시: 홈으로 이동
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>🏠 주소를 입력해주세요</h2>
        <div style={styles.addressContainer}>
          <input style={{...styles.input, flex: 1, marginBottom: 0}} type="text" placeholder="우편번호" value={postcode} readOnly />
          <button style={styles.addressButton} onClick={handleAddressSearch}>주소 찾기</button>
        </div>
        <input style={styles.input} type="text" placeholder="주소" value={address} readOnly />
        <input id="detailAddress" style={styles.input} type="text" placeholder="상세 주소" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} />
        <button style={styles.button} onClick={handleSubmit}>가입 완료</button>
      </div>
    </div>
  );
};

const styles = {
  ...commonStyles,
  addressContainer: {
    display: 'flex',
    marginBottom: '15px',
  },
  addressButton: {
    ...commonStyles.button,
    width: 'auto',
    backgroundColor: '#e0e0e0',
    color: '#333',
    marginLeft: '10px',
    padding: '12px 15px',
    whiteSpace: 'nowrap',
  },
};

export default Signup4;
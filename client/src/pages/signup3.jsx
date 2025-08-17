import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Signup3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevData = location.state || {};

  // 1. 휴대폰 번호를 3부분으로 나누어 state에서 관리
  const [phone, setPhone] = useState({
    part1: '',
    part2: '',
    part3: '',
  });

  // 2. 다음 입력창으로 포커스를 이동시키기 위한 ref 생성
  const inputRef2 = useRef(null);
  const inputRef3 = useRef(null);

  // 3. 입력이 변경될 때마다 실행되는 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 숫자 이외의 값은 입력되지 않도록 필터링
    const sanitizedValue = value.replace(/[^0-9]/g, '');

    setPhone((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // 첫 번째 칸(part1)에 3글자를 입력하면 두 번째 칸으로 이동
    if (name === 'part1' && sanitizedValue.length === 3) {
      inputRef2.current.focus();
    }
    // 두 번째 칸(part2)에 4글자를 입력하면 세 번째 칸으로 이동
    if (name === 'part2' && sanitizedValue.length === 4) {
      inputRef3.current.focus();
    }
  };

  const handleNext = () => {
    const { part1, part2, part3 } = phone;
    if (part1.length < 3 || part2.length < 4 || part3.length < 4) {
      alert('휴대폰 번호를 올바르게 입력해주세요.');
      return;
    }
    // 4. 모든 데이터를 합쳐서 다음 페이지로 전달
    const fullPhone = `${part1}-${part2}-${part3}`;
    navigate('/signup4', { state: { ...prevData, phone: fullPhone } });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>📱 휴대폰 번호를 입력해주세요</h2>
        
        {/* 5. 휴대폰 번호 입력 UI */}
        <div style={styles.phoneContainer}>
          <input
            name="part1"
            style={styles.phoneInput}
            type="text"
            maxLength="3"
            value={phone.part1}
            onChange={handleChange}
          />
          <span style={styles.separator}>-</span>
          <input
            name="part2"
            ref={inputRef2}
            style={styles.phoneInput}
            type="text"
            maxLength="4"
            value={phone.part2}
            onChange={handleChange}
          />
          <span style={styles.separator}>-</span>
          <input
            name="part3"
            ref={inputRef3}
            style={styles.phoneInput}
            type="text"
            maxLength="4"
            value={phone.part3}
            onChange={handleChange}
          />
        </div>
        
        <button style={styles.button} onClick={handleNext}>다음</button>
      </div>
    </div>
  );
};

// 6. 새로운 스타일 추가
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
  // 기존 input 스타일은 삭제해도 됩니다.
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#fcd265',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '15px',
  },
  // 👇 휴대폰 입력창을 위한 스타일
  phoneContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '15px',
  },
  phoneInput: {
    width: '20%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    fontSize: '14px',
    textAlign: 'center',
  },
  separator: {
    fontSize: '16px',
    color: '#333',
    fontWeight: 'bold',
  },
};

export default Signup3;
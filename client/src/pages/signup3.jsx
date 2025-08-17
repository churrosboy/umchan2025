import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { commonStyles } from '../styles/commonStyles';

const Signup3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prevData = location.state || {};

  const [phone, setPhone] = useState({ part1: '', part2: '', part3: '' });
  const inputRef2 = useRef(null);
  const inputRef3 = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^0-9]/g, '');

    setPhone((prev) => ({ ...prev, [name]: sanitizedValue }));

    if (name === 'part1' && sanitizedValue.length === 3) inputRef2.current.focus();
    if (name === 'part2' && sanitizedValue.length === 4) inputRef3.current.focus();
  };

  const handleNext = () => {
    const { part1, part2, part3 } = phone;
    if (part1.length < 3 || part2.length < 3 || part3.length < 4) {
      alert('휴대폰 번호를 올바르게 입력해주세요.');
      return;
    }
    const fullPhone = `${part1}-${part2}-${part3}`;
    navigate('/signup4', { state: { ...prevData, phone: fullPhone } });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>📱 휴대폰 번호를 입력해주세요</h2>
        <div style={styles.phoneContainer}>
          <input name="part1" style={styles.phoneInput} type="tel" maxLength="3" value={phone.part1} onChange={handleChange} />
          <span style={styles.separator}>-</span>
          <input name="part2" ref={inputRef2} style={styles.phoneInput} type="tel" maxLength="4" value={phone.part2} onChange={handleChange} />
          <span style={styles.separator}>-</span>
          <input name="part3" ref={inputRef3} style={styles.phoneInput} type="tel" maxLength="4" value={phone.part3} onChange={handleChange} />
        </div>
        <button style={styles.button} onClick={handleNext}>다음</button>
      </div>
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
    width: '30%',
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
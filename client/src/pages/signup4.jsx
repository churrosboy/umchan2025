import React from 'react';
import { useNavigate } from 'react-router-dom';

const Signup4 = () => {
  const navigate = useNavigate();

  {/*다음 페이지로 이동하는 함수*/}
  const handleNext = () => {
    navigate('/signup5');
  };

  return (
    <div style={styles.wrapper}>  {/*배경*/}
      <div style={styles.container}>  {/*요소들 담은 박스*/}
        <h2 style={styles.title}>🏠 주소를 입력해주세요</h2>  {/*제목*/}
        <input style={styles.input} type="text" placeholder="주소" /> {/*주소 입력란*/}
        <button style={styles.button}>주소 찾기</button>  {/*주소 찾기 버튼, 기능X*/}
        <input style={styles.input} type="text" placeholder="상세 주소" />  {/*상세 주소 입력란*/}
        <button style={styles.button} onClick={handleNext}>다음</button>  {/*다음 버튼, 다음 페이지로 이동하는 함수*/}
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

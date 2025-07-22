import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sales_History = () => {
  const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    }
  
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
          <div style={styles.backButton}><span onClick={goBack}>
                &lt; 뒤로가기
            </span></div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'start',
    padding: '40px 0',
    boxSizing: 'border-box',
    fontFamily: 'Roboto, sans-serif'
  },
  container: {
    width: '100%',
    maxWidth: '375px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  button: {
    backgroundColor: '#FFD856',
    borderRadius: '15px',
    position: 'relative',
    padding: '12px 40px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none'
  },
  leftIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '20px'
  },
  rightIcon: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '20px'
  },
  buttonText: {
    display: 'block'
  },
  backButton: {
        cursor: 'pointer',
        fontSize: 18,
        color: '#333',
  },
};

export default Sales_History;
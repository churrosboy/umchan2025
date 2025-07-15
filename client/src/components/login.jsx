import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const goToSignup = () => {
    navigate('/signup1');
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>로그인</h2>
        <input style={styles.input} type="text" placeholder="이메일" />
        <input style={styles.input} type="password" placeholder="비밀번호" />
        <button style={styles.button}>로그인</button>
        <p style={styles.signupText}>
          계정이 없으신가요? <span onClick={goToSignup} style={styles.link}>회원가입</span>
        </p>
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
  },
  signupText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#fcd265',
    fontWeight: 'bold',
    textDecoration: 'none',
     cursor: 'pointer'
  },
};

export default Login;
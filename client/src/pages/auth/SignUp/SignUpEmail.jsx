import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/commonStyles.css';

const Signup1 = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleNext = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!name || !email) {
      alert('이름과 이메일을 모두 입력해주세요.');
      return;
    }

    if (!emailRegex.test(email)) {
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }

    navigate('/signup/password', { state: { name, email } });
  };

  return (
    <div className="wrapper">
      <div className="container">
        <h2 className="title">✏️ 회원정보를 입력해 주세요</h2>
        <input
          className="input"
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="button" onClick={handleNext}>다음</button>
      </div>
    </div>
  );
};

export default Signup1;
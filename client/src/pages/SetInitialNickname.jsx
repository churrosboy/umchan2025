import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const SetNickname = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (nickname.length < 2 || nickname.length > 10) {
      alert('닉네임은 2~10자 사이로 입력해주세요.');
      return;
    }
    setIsLoading(true);

    try {
      // 1. 닉네임 중복 체크
      const checkResponse = await fetch(`${API_BASE}/api/profile/check-nickname?nickname=${nickname}`);
      const checkData = await checkResponse.json();
      if (!checkData.available) {
        alert('이미 사용 중인 닉네임입니다.');
        setIsLoading(false);
        return;
      }

      // 2. 닉네임 저장
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${API_BASE}/api/users/set-nickname`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname }),
      });

      if (!response.ok) {
        throw new Error('닉네임 설정에 실패했습니다.');
      }

      // 성공 시, 다음 단계인 프로필 상세 설정 페이지로 이동
      navigate('/set-profile-details');

    } catch (error) {
      console.error('닉네임 설정 실패:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>가장 먼저, 닉네임을 설정해주세요.</h2>
      <p>닉네임은 나중에 변경할 수 있습니다.</p>
      
      <input
        type="text"
        placeholder="2~10자 닉네임"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? '저장 중...' : '다음'}
      </button>
    </div>
  );
};

export default SetNickname;
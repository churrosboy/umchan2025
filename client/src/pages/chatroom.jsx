// src/pages/ChatRoom.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Chat from '../pages/chat';

const ChatRoom = () => {
  const { sellerId } = useParams();
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert('로그인이 필요합니다.');
        navigate('/');
      }
    });

    // 판매자 정보 가져오기
    const fetchSellerInfo = async () => {
      try {
        const response = await fetch(`/api/users/${sellerId}`);
        if (!response.ok) throw new Error('판매자 정보를 가져올 수 없습니다.');
        
        const data = await response.json();
        setSellerInfo(data);
      } catch (error) {
        console.error('판매자 정보 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerInfo();
    return () => unsubscribe();
  }, [sellerId, navigate, auth]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={styles.chatPage}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ←
        </button>
        <h2>{sellerInfo?.nickname || '판매자'}</h2>
      </div>
      
      <Chat sellerId={sellerId} />
    </div>
  );
};

const styles = {
  chatPage: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    paddingTop: '70px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    borderRadius: '8px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    marginRight: '10px',
  }
};

export default ChatRoom;
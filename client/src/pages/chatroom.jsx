// src/pages/ChatRoom.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import Chat from '../pages/chat';
import styles from '../styles/Chatroom.module.css';

const ChatRoom = () => {
  const { sellerId } = useParams();
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  // 메시지 읽음 처리 함수
  const markMessagesAsRead = async (chatRoomId, userId) => {
    try {
      const db = getDatabase();
      const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
      
      const snapshot = await get(messagesRef);
      if (snapshot.exists()) {
        const messages = snapshot.val();
        const updates = {};
        
        // 상대방이 보낸 메시지 중 읽지 않은 메시지들을 읽음 처리
        Object.entries(messages).forEach(([messageId, message]) => {
          if (message.senderId !== userId && !message.readBy?.[userId]) {
            updates[`chats/${chatRoomId}/messages/${messageId}/readBy/${userId}`] = true;
          }
        });
        
        // 읽지 않은 메시지가 있으면 업데이트
        if (Object.keys(updates).length > 0) {
          await update(ref(db), updates);
          console.log('메시지 읽음 처리 완료:', Object.keys(updates).length, '개');
        }
      }
    } catch (error) {
      console.error('메시지 읽음 처리 오류:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert('로그인이 필요합니다.');
        navigate('/');
        return;
      }

      // 채팅방 ID 생성 (ChatList와 동일한 방식)
      const chatRoomId = [user.uid, sellerId].sort().join('_');
      
      // 채팅방 진입 시 읽음 처리
      await markMessagesAsRead(chatRoomId, user.uid);
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

  // 창이 활성화될 때마다 읽음 처리 (선택사항)
  useEffect(() => {
    const handleFocus = async () => {
      const user = auth.currentUser;
      if (user && sellerId) {
        const chatRoomId = [user.uid, sellerId].sort().join('_');
        await markMessagesAsRead(chatRoomId, user.uid);
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [sellerId, auth]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className={styles.chatPage}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ←
        </button>
        <h2>{sellerInfo?.nickname || '판매자'}</h2>
      </div>
      <Chat sellerId={sellerId} />
    </div>
  );
};

export default ChatRoom;
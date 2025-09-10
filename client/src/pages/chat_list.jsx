// src/pages/ChatList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import styles from '../styles/ChatList.module.css';

const ChatList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        alert('로그인이 필요합니다.');
        navigate('/');
        return;
      }
      
      fetchChatRooms(user.uid);
    });

    return () => unsubscribe();
  }, [navigate, auth]);

  const fetchChatRooms = (userId) => {
    const db = getDatabase();
    const chatsRef = ref(db, 'chats');
    
    const unsubscribe = onValue(chatsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setChatRooms([]);
        setLoading(false);
        return;
      }

      const chatData = snapshot.val();
      const userChatRooms = [];

      for (const [chatRoomId, chatRoom] of Object.entries(chatData)) {
        if (chatRoomId.includes(userId)) {
          const participants = chatRoomId.split('_');
          const otherUserId = participants.find(id => id !== userId);
          
          const messages = chatRoom.messages || {};
          const messageList = Object.entries(messages)
            .map(([key, value]) => ({ id: key, ...value }))
            .sort((a, b) => b.timestamp - a.timestamp);
          
          const lastMessage = messageList[0];
          
          const unreadCount = messageList.filter(msg => 
            msg.senderId !== userId && !msg.readBy?.[userId]
          ).length;

          userChatRooms.push({
            chatRoomId,
            otherUserId,
            lastMessage,
            unreadCount,
            lastMessageTime: lastMessage?.timestamp || 0
          });
        }
      }

      userChatRooms.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      const chatRoomsWithUserInfo = await Promise.all(
        userChatRooms.map(async (room) => {
          try {
            const userInfoFromCache = userInfo[room.otherUserId];
            if (userInfoFromCache) {
              return { ...room, otherUserInfo: userInfoFromCache };
            }

            const response = await fetch(`/api/users/${room.otherUserId}`);
            if (response.ok) {
              const userData = await response.json();
              setUserInfo(prev => ({ ...prev, [room.otherUserId]: userData }));
              return { ...room, otherUserInfo: userData };
            }
          } catch (error) {
            console.error('사용자 정보 로드 오류:', error);
          }
          
          return { 
            ...room, 
            otherUserInfo: { 
              nickname: '사용자', 
              profileImage: null 
            } 
          };
        })
      );

      setChatRooms(chatRoomsWithUserInfo);
      setLoading(false);
    });

    return unsubscribe;
  };

  const handleChatRoomClick = (chatRoomId, otherUserId) => {
    navigate(`/chat/${otherUserId}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.abs(now - messageTime) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return messageTime.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      return messageTime.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const truncateMessage = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div>채팅방 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    // 최상위 컨테이너 스타일이 flexbox 레이아웃으로 변경되었습니다.
    <div className={styles.container}>
      {/* 헤더는 고정됩니다. */}
      <div className={styles.header}>
        <h2>채팅</h2>
        <div className={styles.chatCount}>
          {chatRooms.length}개의 대화
        </div>
      </div>

      {chatRooms.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💬</div>
          <h3>아직 채팅방이 없습니다</h3>
          <p>다른 사용자와 거래를 시작하면<br />채팅방이 생성됩니다.</p>
        </div>
      ) : (
        // 이 div가 남은 공간을 모두 차지하고, 내부에서만 스크롤됩니다.
        <div className={styles.chatListContainer}>
          {chatRooms.map((room) => (
            <div 
              key={room.chatRoomId} 
              className={["chat-item", styles.chatItem].join(" ")}
              onClick={() => handleChatRoomClick(room.chatRoomId, room.otherUserId)}
            >
              <div className={styles.profileSection}>
                <div className={styles.profileImage}>
                  {room.otherUserInfo?.profileImage ? (
                    <img 
                      src={room.otherUserInfo.profileImage} 
                      alt="프로필" 
                      className={styles.profileImg}
                    />
                  ) : (
                    <div className={styles.defaultProfile}>
                      {room.otherUserInfo?.nickname?.charAt(0) || '사'}
                    </div>
                  )}
                </div>
                
                <div className={styles.chatInfo}>
                  <div className={styles.userNameRow}>
                    <span className={styles.userName}>
                      {room.otherUserInfo?.nickname || '사용자'}
                    </span>
                    <span className={styles.lastMessageTime}>
                      {formatTime(room.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div className={styles.lastMessageRow}>
                    <span className={styles.lastMessage}>
                      {room.lastMessage 
                        ? truncateMessage(room.lastMessage.text)
                        : '새로운 대화를 시작해보세요'
                      }
                    </span>
                    {room.unreadCount > 0 && (
                      <div className={styles.unreadBadge}>
                        {room.unreadCount > 99 ? '99+' : room.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// hover 효과를 위한 추가 스타일 (기존 코드 유지)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .chat-item:hover {
      background-color: #f8f9fa !important;
    }
  `;
  document.head.appendChild(style);
}

export default ChatList;
// src/pages/ChatList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, onValue, query, orderByChild } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
      
      // 사용자의 채팅방 목록 가져오기
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

      // 사용자가 참여한 채팅방 필터링
      for (const [chatRoomId, chatRoom] of Object.entries(chatData)) {
        if (chatRoomId.includes(userId)) {
          // 상대방 ID 추출
          const participants = chatRoomId.split('_');
          const otherUserId = participants.find(id => id !== userId);
          
          // 마지막 메시지 가져오기
          const messages = chatRoom.messages || {};
          const messageList = Object.entries(messages)
            .map(([key, value]) => ({ id: key, ...value }))
            .sort((a, b) => b.timestamp - a.timestamp);
          
          const lastMessage = messageList[0];
          
          // 읽지 않은 메시지 개수 계산
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

      // 마지막 메시지 시간순으로 정렬
      userChatRooms.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      // 상대방 정보 가져오기
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
      <div style={styles.loadingContainer}>
        <div>채팅방 목록을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>채팅</h2>
        <div style={styles.chatCount}>
          {chatRooms.length}개의 대화
        </div>
      </div>

      {chatRooms.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <h3>아직 채팅방이 없습니다</h3>
          <p>다른 사용자와 거래를 시작하면<br />채팅방이 생성됩니다.</p>
        </div>
      ) : (
        <div style={styles.chatList}>
          {chatRooms.map((room) => (
            <div 
              key={room.chatRoomId} 
              style={styles.chatItem}
              onClick={() => handleChatRoomClick(room.chatRoomId, room.otherUserId)}
            >
              <div style={styles.profileSection}>
                <div style={styles.profileImage}>
                  {room.otherUserInfo?.profileImage ? (
                    <img 
                      src={room.otherUserInfo.profileImage} 
                      alt="프로필" 
                      style={styles.profileImg}
                    />
                  ) : (
                    <div style={styles.defaultProfile}>
                      {room.otherUserInfo?.nickname?.charAt(0) || '사'}
                    </div>
                  )}
                </div>
                
                <div style={styles.chatInfo}>
                  <div style={styles.userNameRow}>
                    <span style={styles.userName}>
                      {room.otherUserInfo?.nickname || '사용자'}
                    </span>
                    <span style={styles.lastMessageTime}>
                      {formatTime(room.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div style={styles.lastMessageRow}>
                    <span style={styles.lastMessage}>
                      {room.lastMessage 
                        ? truncateMessage(room.lastMessage.text)
                        : '새로운 대화를 시작해보세요'
                      }
                    </span>
                    {room.unreadCount > 0 && (
                      <div style={styles.unreadBadge}>
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

const styles = {
  container: {
    width: '100%',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    paddingTop: '70px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: '16px',
    color: '#666',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #eee',
  },
  chatCount: {
    color: '#666',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  chatList: {
    backgroundColor: 'white',
  },
  chatItem: {
    padding: '15px 20px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    backgroundColor: 'white',
    transition: 'background-color 0.2s',
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
  },
  profileImage: {
    marginRight: '12px',
  },
  profileImg: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  defaultProfile: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#ffc038',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  userNameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  lastMessageTime: {
    fontSize: '12px',
    color: '#999',
  },
  lastMessageRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: '14px',
    color: '#666',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  unreadBadge: {
    backgroundColor: '#ff4757',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 7px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginLeft: '8px',
    minWidth: '18px',
    textAlign: 'center',
  },
};

// hover 효과를 위한 추가 스타일 (인라인으로는 제한적)
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
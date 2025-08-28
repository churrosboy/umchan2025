// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, push, onValue, query, orderByChild } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const Chat = ({ sellerId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const auth = getAuth();
  const messagesEndRef = useRef(null);

  // 메시지 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    // 채팅방 ID 생성
    const chatRoomId = [auth.currentUser.uid, sellerId].sort().join('_');
    console.log("채팅방 ID:", chatRoomId);
    
    const db = getDatabase();
    const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
    
    // 메시지 실시간 수신
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      console.log("데이터 변경 감지:", snapshot.exists());
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const messageList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        console.log("처리된 메시지:", messageList);
        setMessages(messageList);
        
        // 스크롤을 즉시 수행하지 않고 상태 업데이트 후 수행
        setTimeout(scrollToBottom, 100);
      } else {
        console.log("채팅 데이터가 없습니다");
        setMessages([]);
      }
    }, (error) => {
      console.error("메시지 수신 오류:", error);
    });

    return () => unsubscribe();
  }, [sellerId, auth.currentUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const chatRoomId = [auth.currentUser.uid, sellerId].sort().join('_');
    const db = getDatabase();
    const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
    
    // 메시지 저장
    push(messagesRef, {
      text: newMessage,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || '사용자',
      timestamp: Date.now()
    });
    
    setNewMessage('');
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.messageList}>
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{
              ...styles.message,
              ...(msg.senderId === auth.currentUser?.uid ? styles.myMessage : styles.otherMessage)
            }}
          >
            <div style={styles.messageBubble}>
              {msg.text}
            </div>
            <div style={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form style={styles.inputContainer} onSubmit={handleSendMessage}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          style={styles.input}
          rows="1"
          onInput={(e) => {
            e.target.style.height = 'auto';  // 이 부분이 문제
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
        <button type="submit" style={styles.sendButton}><strong>전송</strong></button>
      </form>
    </div>
  );
};

const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '70vh',
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#ffffffff',
  },
  messageList: {
    flex: 1,
    padding: '10px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  message: {
    marginBottom: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: '8px 12px',
    borderRadius: '8px',
    maxWidth: '70%',
    wordBreak: 'break-word',
  },
  messageTime: {
    fontSize: '10px',
    color: '#888',
    marginTop: '2px',
  },
  inputContainer: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ddd',
  },
  input: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginRight: '8px',
    resize: 'none',
    minHeight: '10px',
    maxHeight: '70px',
    overflowY: 'auto', 
    fontFamily: 'inherit',
    fontSize: 'inherit',
  },
  sendButton: {
    padding: '8px 15px',
    backgroundColor: '#ffc038ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  }
};

export default Chat;
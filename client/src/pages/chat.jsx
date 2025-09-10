// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, push, onValue, query, orderByChild } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const Chat = ({ sellerId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const auth = getAuth();
  const messagesEndRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderInfo, setOrderInfo] = useState({ date: '', time: '', location: '', item: '', price: '', etc: '' });

  // 메시지 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
  if (showOptions) {
    setTimeout(scrollToBottom, 100);
  }
}, [showOptions]);

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

  /*
  const handleConfirmOrder = async () => {
    if (!auth.currentUser) return;

    try {
      const response = await fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: sellerId,
          buyer_id: auth.currentUser.uid,
          item_id: 'sample_item_id', // 실제 item_id로 교체 필요
          location: 'sample_location', // 실제 location으로 교체 필요
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('주문이 성공적으로 생성되었습니다.');

        // 로컬 스토리지에서 장바구니 아이템 제거
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          const updatedCart = parsedCart.filter(item => item.itemId !== 'sample_item_id');
          localStorage.setItem('cart', JSON.stringify(updatedCart));
        }

      } else {
        alert('주문 생성에 실패했습니다: ' + data.message);
      }
    } catch (error) {
      console.error('주문 생성 오류:', error);
      alert('주문 생성 중 오류가 발생했습니다.');
    }
  };
  */

  const createOrder = async (message) => {
    if (!auth.currentUser) return;

    try {
      const response = await fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: sellerId,
          buyer_id: auth.currentUser.uid,
          item_id: 'sample_item_id', // 실제 item_id로 교체 필요
          location: 'sample_location', // 실제 location으로 교체 필요
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('주문이 성공적으로 생성되었습니다.');

        // 로컬 스토리지에서 장바구니 아이템 제거
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          const updatedCart = parsedCart.filter(item => item.itemId !== 'sample_item_id');
          localStorage.setItem('cart', JSON.stringify(updatedCart));
        } else {
          console.log("로컬 스토리지에 장바구니 데이터가 없습니다.");
        }

        // 주문 수락 메시지를 채팅으로 전송
        const chatRoomId = [auth.currentUser.uid, sellerId].sort().join('_');
        const db = getDatabase();
        const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
        push(messagesRef, {
          text: `[주문 수락]\n주문이 성공적으로 생성되었습니다!`,
          senderId: auth.currentUser.uid,
          senderName: auth.currentUser.displayName || '사용자',
          timestamp: Date.now(),
          type: 'order'
        });

      } else {
        alert('주문 생성에 실패했습니다: ' + data.message);
      }
    } catch (error) {
      console.error('주문 생성 오류:', error);
      alert('주문 생성 중 오류가 발생했습니다.');
    }
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
            <div style={
              {
                ...(msg.type !== 'order' ? 
                      {
                        ...styles.messageBubble
                      }
                      : 
                      {
                        ...styles.orderMessageBubble,
                      }
                    )
              }
            }>

              {msg.text.split('\n').map((line, idx) => (
                <div
                  key={idx}
                  style={{
                    ...(
                      msg.type === 'order' ? 
                      {
                        textAlign: idx === 1 ? 'center' : 'left',
                        fontWeight: idx === 1 ? 'bold' : 'normal',
                        padding: '5px 10px',
                        width: '250px',
                      }
                      : 
                      {}
                )}}>
                  {line}
                </div>
              ))}

              {msg.type === 'order' && ( // 상대방이 보낸 주문일때만 버튼 활성화 // msg.senderId !== auth.currentUser?.uid &&
                <button
                  style={{
                    marginTop: '15px',
                    marginBottom: '10px',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#ffc038',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex', 
                    alignItems: 'center',      // 세로 중앙 정렬
                    justifyContent: 'center',  // 가로 중앙 정렬
                    margin: '0 auto',
                    width: '80%', 
                    height: '35px',
                    fontSize: '15px',
                    display: 'flex'
                  }}
                  onClick={() => createOrder(msg)}
                >
                  주문 수락
                </button>
              )}
            </div>
            <div style={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form style={styles.inputContainer} onSubmit={handleSendMessage}>
        <button type="button" style={styles.sendButton} onClick={() => setShowOptions((prev) => !prev)}><strong>+</strong></button>
        <textarea
          onClick={() => setShowOptions(false)}
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

      <div
        style={{
          ...styles.optionsPanel,
          maxHeight: showOptions ? 120 : 0,
          opacity: showOptions ? 1 : 0,
          transition: 'max-height 0.3s ease, opacity 0.3s ease',
        }}
      >
        <button style={styles.optionBtn} onClick={() => setShowOrderModal(true)}>
            주문 확정
        </button>
      </div>

      {showOrderModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>주문 상세 입력</h3>
            <input
              type="date"
              placeholder="거래 희망 날짜"
              value={orderInfo.date}
              onChange={e => setOrderInfo({ ...orderInfo, date: e.target.value })}
              style={{fontSize: '15px'}}
            />

            <input
              type="time"
              placeholder="거래 시간"
              value={orderInfo.time}
              onChange={e => setOrderInfo({ ...orderInfo, time: e.target.value })}
              style={{fontSize: '15px'}}
            />

            <input
              type="text"
              placeholder="거래 희망 장소"
              value={orderInfo.location}
              onChange={e => setOrderInfo({ ...orderInfo, location: e.target.value })}
              style={{fontSize: '15px'}}
            />

            <input
              type="text"
              placeholder="메뉴 이름"
              value={orderInfo.item}
              onChange={e => setOrderInfo({ ...orderInfo, item: e.target.value })}
              style={{fontSize: '15px'}}
            />

            <input
              type="text"
              placeholder="가격"
              value={orderInfo.price}
              onChange={e => setOrderInfo({ ...orderInfo, price: e.target.value })}
              style={{fontSize: '15px'}}
            />

            <textarea
              placeholder="기타 요청사항"
              value={orderInfo.etc}
              onChange={e => setOrderInfo({ ...orderInfo, etc: e.target.value })}
              style={{fontSize: '12px', resize: 'vertical', height: '60px'}}
            />

            <button
              onClick={() => {
                if (
                  !orderInfo.item.trim() ||
                  !orderInfo.price.trim() ||
                  !orderInfo.date.trim() ||
                  !orderInfo.time.trim() ||
                  !orderInfo.location.trim()
                ) {
                  alert('모든 주문 정보를 입력해주세요.');
                  return;
                }
                // 주문 요청 메시지를 채팅으로 전송
                const chatRoomId = [auth.currentUser.uid, sellerId].sort().join('_');
                const db = getDatabase();
                const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
                push(messagesRef, {
                  text: `
                    주문요청이 도착했어요!\n
                    메뉴: ${orderInfo.item}\n
                    가격: ${orderInfo.price}\n
                    거래 희망일: ${orderInfo.date} ${orderInfo.time}\n
                    거래 장소: ${orderInfo.location}\n
                    요청사항: ${orderInfo.etc}
                  `,
                  senderId: auth.currentUser.uid,
                  senderName: auth.currentUser.displayName || '사용자',
                  timestamp: Date.now(),
                  type: 'order'
                });
                setShowOrderModal(false);
                setOrderInfo({ date: '', time: '', location: '', item: '', price: '', etc: '' });
              }}
              style={{...styles.sendButton, margin: '-5px 0px'}}
            >
              주문 요청 보내기
            </button>
            <button 
              onClick={() => setShowOrderModal(false)}
              style={{...styles.sendButton, margin: '-5px 0px'}}
            >
              닫기
            </button>
          </div>
        </div>
      )}

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
    whiteSpace: 'pre-line',
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
    marginLeft: '8px',
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
  },
  optionsPanel: {
    overflow: 'hidden',
    background: '#f9f9f9',
    display: 'flex',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    alignItems: 'center',
  },
  optionBtn: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    background: '#eee',
    cursor: 'pointer',
    fontSize: '15px',
    margin: '15px 10px',
  },
  modalOverlay: {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    padding: '24px',
    borderRadius: '8px',
    minWidth: '300px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    paddingBottom: '30px',
  },
  orderMessageBubble: {
    padding: '8px 12px',
  }
};

export default Chat;
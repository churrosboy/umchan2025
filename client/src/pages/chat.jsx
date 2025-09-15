// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, push, onValue, query, orderByChild } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import styles from '../styles/Chat.module.css';
const API_URL = process.env.REACT_APP_API_URL;

const Chat = ({ sellerId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const auth = getAuth();
  const messagesEndRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [itemOptions, setItemOptions] = useState([]);     // 상품 리스트
  const [selectedItem, setSelectedItem] = useState(null); // 선택한 상품
  const [role, setRole] = useState(null);                 // 'seller' | 'buyer'

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderInfo, setOrderInfo] = useState({ date: '', time: '', location: '', item: '', price: '', etc: '', sellerId: '', buyerId: '' });

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

  const selectRole = async (picked) => {
    setRole(picked); // 'seller' | 'buyer'
    const targetUserId = picked === 'seller' ? auth.currentUser.uid : sellerId;
    console.log('선택된 역할:', picked, '대상 사용자 ID:', targetUserId);
    await fetchProductsByUser(targetUserId);
  };


  const fetchProductsByUser = async (targetUserId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/products/user/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('API 응답:', data);
      if (Array.isArray(data)) setItemOptions(data);
      else setItemOptions([]);
    } catch (e) {
      console.error('상품 조회 실패:', e);
      setItemOptions([]);
    }
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
      const response = await fetch(`/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: (message.sellerId)? message.sellerId : auth.currentUser.uid,
          buyer_id: (message.buyerId)? message.buyerId : auth.currentUser.uid,
          item_id: message.itemId,
          location: message.location,
        })
      });

      console.log('주문 생성 요청 응답:', response);

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

        const itemName = itemOptions.find(it => it.item_id === message.itemId)?.name || '알 수 없는 상품';

        // 주문 수락 메시지를 채팅으로 전송
        const chatRoomId = [auth.currentUser.uid, sellerId].sort().join('_');
        const db = getDatabase();
        const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
        push(messagesRef, {
          text: `
                [주문 수락]\n
                '${itemName}' 반찬 주문이 수락되었습니다!
              `,
          senderId: auth.currentUser.uid,
          senderName: auth.currentUser.displayName || '',
          timestamp: Date.now(),
          type: "orderAccept"
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
    <div className={styles.chatContainer}>
      <div className={styles.messageList}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={[
              styles.message,
              msg.senderId === auth.currentUser?.uid ? styles.myMessage : styles.otherMessage
            ].join(' ')}
          >
            <div 
              className={
                msg.type === 'orderAccept'
                  ? styles.orderAcceptMessageBubble
                  : msg.type === 'order'
                  ? styles.orderMessageBubble
                  : styles.messageBubble
              }
            >

              {msg.text.split('\n').map((line, idx) => (
                <div
                  key={idx}
                  style={
                    msg.type === 'order' || 'orderAccept'
                      ? {
                          textAlign: idx === 1 ? 'center' : 'left',
                          fontWeight: idx === 1 ? 'bold' : 'normal',
                          padding: '5px 10px',
                          width: '250px',
                        }
                      : {}
                  }
                >
                  {line}
                </div>
              ))}

              {msg.type === 'order' && ( // 상대방이 보낸 주문일때만 버튼 활성화 // msg.senderId !== auth.currentUser?.uid &&
                <button
                  className={styles.orderAcceptBtn}
                  onClick={() => createOrder(msg)}
                >
                  주문 수락
                </button>
              )}
            </div>
            <div className={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputContainer} onSubmit={handleSendMessage}>
        <button type="button" className={styles.sendButton} onClick={() => setShowOptions((prev) => !prev)} style={{ marginRight: '8px' }}><strong>+</strong></button>
        <textarea
          onClick={() => setShowOptions(false)}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className={styles.input}
          rows="1"
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
        <button type="submit" className={styles.sendButton}><strong>전송</strong></button>
      </form>

      <div
        className={styles.optionsPanel}
        style={{
          maxHeight: showOptions ? 120 : 0,
          opacity: showOptions ? 1 : 0,
          transition: 'max-height 0.3s ease, opacity 0.3s ease',
        }}
      >
        <button className={styles.optionBtn} onClick={() => setShowOrderModal(true)}>
            주문 확정
        </button>
      </div>

      {showOrderModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>주문 상세 입력</h3>
            <div style={{ fontWeight: 500, fontSize: 14, marginTop: -20, marginBottom: -10 }}>거래 유형을 선택해주세요.</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 15 }}>
              <button className={styles.sendButton} style={{ flex: 1 }} onClick={() => selectRole('seller') || setOrderInfo({...orderInfo, sellerId: auth.currentUser?.uid, buyerId: ''})}>판매하기</button>
              <button className={styles.sendButton} style={{ flex: 1 }} onClick={() => selectRole('buyer') || setOrderInfo({...orderInfo, sellerId: '', buyerId: auth.currentUser?.uid})}>구매하기</button>
            </div>

<div style={{ fontWeight: 500, fontSize: 14, marginBottom: -10 }}>
  거래를 원하는 상품을 선택해주세요.
</div>
    <div className={styles.modalList}>
      {itemOptions.length === 0 && (
        <div style={{ fontSize: 15, color: '#777', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>표시할 상품이 없습니다.</div>
      )}
      {itemOptions.map((it) => (
        <div
          key={it.item_id}
          className={styles.modalItem}
          style={{
            borderColor: selectedItem?.item_id === it.item_id ? '#ffc038' : '#eee',
            background: selectedItem?.item_id === it.item_id ? '#fff8e6' : '#fff'
          }}
          onClick={() => setSelectedItem(it) || setOrderInfo({ ...orderInfo, item: it.name})} // 선택된 상품명과 가격을 orderInfo에 설정
        >
          <div style={{ fontWeight: 600 }}>{it.name}</div>
          <div style={{ fontSize: 12, color: '#555' }}>{it.type} · {it.price}원</div>
        </div>
      ))}
</div>
            <input
              type="date"
              placeholder="거래 희망 날짜"
              value={orderInfo.date}
              onChange={e => setOrderInfo({ ...orderInfo, date: e.target.value })}
              style={{fontSize: '15px', marginBottom: '-10px'}}
            />

            <input
              type="time"
              placeholder="거래 시간"
              value={orderInfo.time}
              onChange={e => setOrderInfo({ ...orderInfo, time: e.target.value })}
              style={{fontSize: '15px', marginBottom: '-10px'}}
            />

            <input
              type="text"
              placeholder="거래 희망 장소"
              value={orderInfo.location}
              onChange={e => setOrderInfo({ ...orderInfo, location: e.target.value })}
              style={{fontSize: '15px', marginBottom: '-10px'}}
            />

            <input
              type="text"
              placeholder="가격"
              value={orderInfo.price}
              onChange={e => setOrderInfo({ ...orderInfo, price: e.target.value })}
              style={{fontSize: '15px', marginBottom: '-10px'}}
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
                    요청사항: ${orderInfo.etc ? orderInfo.etc : '없음'}
                  `,
                  senderId: auth.currentUser.uid,
                  senderName: auth.currentUser.displayName || '',
                  sellerId: orderInfo.sellerId,
                  buyerId: orderInfo.buyerId,
                  itemId: selectedItem?.item_id || '',
                  location: orderInfo.location,
                  timestamp: Date.now(),
                  type: 'order'
                });
                setShowOrderModal(false);
                setOrderInfo({ date: '', time: '', location: '', item: '', price: '', etc: '' , sellerId: '', buyerId: '' });
              }}
              className={styles.sendButton}
              style={{margin: '-5px 0px'}}
            >
              주문 요청 보내기
            </button>
            <button 
              onClick={() => setShowOrderModal(false)}
              className={styles.sendButton}
              style={{margin: '-5px 0px'}}
            >
              닫기
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Chat;
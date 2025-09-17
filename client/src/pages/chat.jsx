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
  const [orderInfo, setOrderInfo] = useState({
    date: '', time: '', location: '', item: '', price: '', etc: '',
    sellerId: '', buyerId: ''
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { if (showOptions) setTimeout(scrollToBottom, 100); }, [showOptions]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const me = auth.currentUser.uid;
    const other = sellerId;
    const chatRoomId = [me, other].sort().join('_');

    const db = getDatabase();
    const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const messageList = Object.entries(data).map(([key, value]) => ({
          id: key, ...value
        })).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList);
        setTimeout(scrollToBottom, 100);
      } else {
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

    const me = auth.currentUser.uid;
    const other = sellerId;
    const chatRoomId = [me, other].sort().join('_');
    const db = getDatabase();
    const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
    
    push(messagesRef, {
      text: newMessage,
      senderId: me,
      senderName: auth.currentUser.displayName || '사용자',
      timestamp: Date.now()
    });
    setNewMessage('');
  };

  // 역할 선택 시: 상품 목록 주인도 명확히 지정
  const selectRole = async (picked) => {
    setRole(picked); // 'seller' | 'buyer'
    const me = auth.currentUser?.uid;
    const other = sellerId;

    // 판매하기 → 내 상품 / 구매하기 → 상대방 상품
    const targetUserId = picked === 'seller' ? me : other;

    // 주문 정보에 seller/buyer도 명시
    if (picked === 'seller') {
      setOrderInfo(prev => ({ ...prev, sellerId: me, buyerId: other }));
    } else {
      setOrderInfo(prev => ({ ...prev, sellerId: other, buyerId: me }));
    }

    await fetchProductsByUser(targetUserId);
  };

  const fetchProductsByUser = async (targetUserId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/products/user/${targetUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setItemOptions(data);
      else setItemOptions([]);
    } catch (e) {
      console.error('상품 조회 실패:', e);
      setItemOptions([]);
    }
  };

  // ✅ 주문 생성: 역할에 따라 seller/buyer를 명확히 설정
  const createOrder = async (message) => {
    if (!auth.currentUser) return;

    const me = auth.currentUser.uid;
    const other = sellerId;

    // 우선순위: 메시지에 명시된 값 → 없으면 role 기준으로 결정
    const sellerIdFinal = message?.sellerId
      ? message.sellerId
      : (role === 'seller' ? me : other);
    const buyerIdFinal  = message?.buyerId
      ? message.buyerId
      : (role === 'seller' ? other : me);

    try {
      const response = await fetch(`/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: sellerIdFinal,
          buyer_id: buyerIdFinal,
          item_id: message.itemId,
          location: message.location,
          // 필요 시 price/date/time 등도 API에 맞춰 추가
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('주문이 성공적으로 생성되었습니다.');

        // (선택) localStorage 장바구니 정리 로직 유지
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          const updatedCart = parsedCart.filter(item => item.itemId !== message.itemId);
          localStorage.setItem('cart', JSON.stringify(updatedCart));
        }

        const itemName = itemOptions.find(it => it.item_id === message.itemId)?.name || '알 수 없는 상품';

        // 주문 수락 알림 메시지
        const chatRoomId = [me, other].sort().join('_');
        const db = getDatabase();
        const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
        push(messagesRef, {
          text: `[주문 수락]\n'${itemName}' 반찬 주문이 수락되었습니다!`,
          senderId: me,
          senderName: auth.currentUser.displayName || '',
          timestamp: Date.now(),
          type: "orderAccept"
        });

      } else {
        alert('주문 생성에 실패했습니다: ' + (data.message || ''));
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
              {msg.text.split('\n').map((line, i) => (
                <div
                  key={i}
                  style={
                    (msg.type === 'order' || msg.type === 'orderAccept')
                      ? {
                          textAlign: i === 0 ? 'left' : (i === 1 ? 'center' : 'left'),
                          fontWeight: i === 1 ? 'bold' : 'normal',
                          padding: '5px 10px',
                          width: '250px',
                        }
                      : {}
                  }
                >
                  {line}
                </div>
              ))}

              {msg.type === 'order' && (
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
        <button
          type="button"
          className={styles.sendButton}
          onClick={() => setShowOptions((prev) => !prev)}
          style={{ marginRight: '8px' }}
        >
          <strong>+</strong>
        </button>
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

            <div style={{ fontWeight: 500, fontSize: 14, marginTop: -20, marginBottom: -10 }}>
              거래 유형을 선택해주세요.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 15 }}>
              <button
                className={styles.sendButton}
                style={{ flex: 1 }}
                onClick={async () => {
                  await selectRole('seller'); // 판매하기
                }}
              >
                판매하기
              </button>
              <button
                className={styles.sendButton}
                style={{ flex: 1 }}
                onClick={async () => {
                  await selectRole('buyer'); // 구매하기
                }}
              >
                구매하기
              </button>
            </div>

            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: -10 }}>
              거래를 원하는 상품을 선택해주세요.
            </div>
            <div className={styles.modalList}>
              {itemOptions.length === 0 && (
                <div style={{ fontSize: 15, color: '#777', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  표시할 상품이 없습니다.
                </div>
              )}
              {itemOptions.map((it) => (
                <div
                  key={it.item_id}
                  className={styles.modalItem}
                  style={{
                    borderColor: selectedItem?.item_id === it.item_id ? '#ffc038' : '#eee',
                    background: selectedItem?.item_id === it.item_id ? '#fff8e6' : '#fff'
                  }}
                  onClick={() => {
                    setSelectedItem(it);
                    setOrderInfo(prev => ({ ...prev, item: it.name }));
                  }}
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
                if (!orderInfo.price.trim() || !orderInfo.date.trim() || !orderInfo.time.trim() || !orderInfo.location.trim()) {
                  alert('모든 주문 정보를 입력해주세요.');
                  return;
                }
                const me = auth.currentUser.uid;
                const other = sellerId;
                // 메시지에 sellerId/buyerId를 명확히 포함
                const sellerIdMsg = role === 'seller' ? me : other;
                const buyerIdMsg  = role === 'seller' ? other : me;

                const chatRoomId = [me, other].sort().join('_');
                const db = getDatabase();
                const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
                push(messagesRef, {
                  text:
                    `주문요청이 도착했어요!\n` +
                    `메뉴: ${orderInfo.item}\n` +
                    `가격: ${orderInfo.price}\n` +
                    `거래 희망일: ${orderInfo.date} ${orderInfo.time}\n` +
                    `거래 장소: ${orderInfo.location}\n` +
                    `요청사항: ${orderInfo.etc ? orderInfo.etc : '없음'}`,
                  senderId: me,
                  senderName: auth.currentUser.displayName || '',
                  sellerId: sellerIdMsg,
                  buyerId: buyerIdMsg,
                  itemId: selectedItem?.item_id || '',
                  location: orderInfo.location,
                  timestamp: Date.now(),
                  type: 'order'
                });
                setShowOrderModal(false);
                setOrderInfo({ date: '', time: '', location: '', item: '', price: '', etc: '', sellerId: '', buyerId: '' });
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

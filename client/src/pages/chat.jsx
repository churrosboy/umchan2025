// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, push, onValue, query, orderByChild, set, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const Chat = ({ sellerId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const auth = getAuth();
  const messagesEndRef = useRef(null);

  // === 거래 관련 상태 ===
  const [trade, setTrade] = useState(null);               // RTDB에 저장된 trade 상태
  const [isModalOpen, setIsModalOpen] = useState(false);  // 모달 열림
  const [modalStep, setModalStep] = useState(1);          // 1: 역할, 2: 상품선택, 3: 최종확인
  const [role, setRole] = useState(null);                 // 'seller' | 'buyer'
  const [itemOptions, setItemOptions] = useState([]);     // 상품 리스트
  const [selectedItem, setSelectedItem] = useState(null); // 선택한 상품
  const [busy, setBusy] = useState(false);                // 버튼 중복 방지
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';
  const [hideReviewCTA, setHideReviewCTA] = useState(false);
  const [reviewHideKey, setReviewHideKey] = useState(null);

  // 리뷰 모달 상태
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewImage, setReviewImage] = useState(''); // 선택: 이미지 URL 한 장
  const [submittingReview, setSubmittingReview] = useState(false);

  // 메시지 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 채팅방 ID
  const chatRoomId = auth.currentUser
    ? [auth.currentUser.uid, sellerId].sort().join('_')
    : null;

  // 메시지 실시간 수신
  useEffect(() => {
    if (!auth.currentUser) return;
    const db = getDatabase();
    const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const messageList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
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
  }, [sellerId, auth.currentUser]); // eslint-disable-line

  // 거래 상태 실시간 구독
  useEffect(() => {
    if (!auth.currentUser) return;
    const db = getDatabase();
    const tradeRef = ref(db, `chats/${chatRoomId}/trade`);
    const unsub = onValue(tradeRef, (snap) => {
      if (snap.exists()) setTrade(snap.val());
      else setTrade(null);
    });
    return () => unsub();
  }, [sellerId, auth.currentUser]); // eslint-disable-line

  // 상품 리스트 가져오기
  const fetchProductsByUser = async (targetUserId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/products/user/${targetUserId}`, {
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

  // 거래 시작 모달 열기
  const openTradeModal = () => {
    if (busy) return;
    // 진행 중/대기중이면 시작 못함
    if (trade && (trade.status === 'pending' || trade.status === 'in_progress')) return;
    setModalStep(1);
    setRole(null);
    setSelectedItem(null);
    setItemOptions([]);
    setIsModalOpen(true);
  };

  // 역할 선택
  const selectRole = async (picked) => {
    setRole(picked); // 'seller' | 'buyer'
    setModalStep(2);
    const targetUserId = picked === 'seller' ? auth.currentUser.uid : sellerId;
    await fetchProductsByUser(targetUserId);
  };

  // 최종 확인으로 이동
  const goConfirm = () => {
    if (!selectedItem) return;
    setModalStep(3);
  };

  // 거래 시작(확인 - 예)
  const confirmInitiateTrade = async () => {
    if (!auth.currentUser || !selectedItem || !role) return;
    try {
      setBusy(true);
      const db = getDatabase();
      const tradeRef = ref(db, `chats/${chatRoomId}/trade`);

      const currentUid = auth.currentUser.uid;
      const seller = role === 'seller' ? currentUid : sellerId;
      const buyer  = role === 'seller' ? sellerId   : currentUid;

      const payload = {
        status: 'pending',
        initiatorId: currentUid,
        sellerId: seller,
        buyerId: buyer,
        item: {
          item_id: selectedItem.item_id,
          name: selectedItem.name,
          type: selectedItem.type
        },
        participants: { [seller]: true, [buyer]: true }, // RTDB rules 용
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await set(tradeRef, payload);
      setIsModalOpen(false);
    } catch (e) {
      console.error('거래 시작 실패:', e);
      alert('거래를 시작할 수 없습니다.');
    } finally {
      setBusy(false);
    }
  };

  // 거래 수락/거절 모달 열기
  const handleAcceptClick = () => {
    if (!trade || !trade.item) return;
    // 간단히 브라우저 confirm 사용 (디자인 영향 최소)
    const ok = window.confirm(`${trade.item.name}을(를) 거래하시겠습니까?`);
    if (ok) acceptTrade();
    else cancelTrade();
  };

  const acceptTrade = async () => {
    if (!auth.currentUser || !trade) return;
    try {
      setBusy(true);
      const db = getDatabase();
      const tradeRef = ref(db, `chats/${chatRoomId}/trade`);
      await update(tradeRef, {
        status: 'in_progress',
        updatedAt: Date.now()
      });
    } catch (e) {
      console.error('거래 수락 실패:', e);
      alert('거래 수락에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const cancelTrade = async () => {
    if (!auth.currentUser || !trade) return;
    try {
      setBusy(true);
      const db = getDatabase();
      const tradeRef = ref(db, `chats/${chatRoomId}/trade`);
      await update(tradeRef, {
        status: 'cancelled',
        updatedAt: Date.now()
      });
      alert('거래가 취소되었습니다.');
    } catch (e) {
      console.error('거래 취소 실패:', e);
    } finally {
      setBusy(false);
    }
  };

  // 거래 완료
  const completeTrade = async () => {
    if (!auth.currentUser || !trade || !trade.item) return;
    try {
      setBusy(true);
      const token = await auth.currentUser.getIdToken();
      // sellerId/buyerId/type 정보로 백엔드 카운트 증가
      const res = await fetch(`${API_BASE}/api/trade/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sellerId: trade.sellerId,
          buyerId: trade.buyerId,
          item_id: trade.item.item_id,
          type: trade.item.type
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || '거래 완료 처리 실패');
      }

      // RTDB 상태 업데이트
      const db = getDatabase();
      const tradeRef = ref(db, `chats/${chatRoomId}/trade`);
      await update(tradeRef, {
        status: 'completed',
        updatedAt: Date.now()
      });

      alert('거래가 완료되었습니다!');
    } catch (e) {
      console.error('거래 완료 실패:', e);
      alert('거래 완료 처리에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  // 리뷰 작성 이동(완료 후, 구매자에게만 노출)
  const goWriteReview = () => {
    if (!trade || !trade.item) return;
    const url = `/reviews/new?seller=${encodeURIComponent(trade.sellerId)}&item_id=${encodeURIComponent(trade.item.item_id)}`;
    window.location.href = url; // 라우터 사용 안하고 최소 변경
  };

  const handleReviewClick = () => {
    setIsReviewModalOpen(true);
  };

  const submitReview = async () => {
    if (!trade?.item || !auth.currentUser) return;
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      alert('별점(1~5)을 선택하세요.');
      return;
    }
    setSubmittingReview(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const body = {
        seller_id: trade.sellerId,
        writer_id: auth.currentUser.uid,
        item_id: trade.item.item_id || '',
        rating: reviewRating,
        content: reviewText || '',
        image_url: reviewImage ? [reviewImage] : [],
        timestamp: new Date().toISOString()
      };

      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('[reviews] HTTP', res.status, text);
        let msg = '리뷰 등록 실패';
        try {
          const j = JSON.parse(text);
          msg = j?.error || msg;
        } catch {}
        throw new Error(`${msg} (HTTP ${res.status})`);
      }

      alert('리뷰가 등록되었습니다!');
      setIsReviewModalOpen(false);
      setReviewText('');
      setReviewImage('');
      setReviewRating(5);

      // 이번 거래에서는 리뷰 CTA 숨김 유지
      if (reviewHideKey) localStorage.setItem(reviewHideKey, '1');
      setHideReviewCTA(true);
    } catch (e) {
      console.error('리뷰 등록 실패:', e);
      alert('리뷰 등록에 실패했습니다.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const cancelReview = () => {
    setIsReviewModalOpen(false);
    // “나중에 할게요” → 이번 거래에선 버튼 숨김
    if (reviewHideKey) localStorage.setItem(reviewHideKey, '1');
    setHideReviewCTA(true);
  };


  // 거래 버튼 라벨/상태 계산
  const currentUid = auth.currentUser?.uid;
  const status = trade?.status || 'idle';
  const isInitiator = trade?.initiatorId === currentUid;
  const amSeller = trade?.sellerId === currentUid;
  const amBuyer = trade?.buyerId === currentUid;

  let tradeBtnLabel = '거래하기';
  let tradeBtnDisabled = false;
  let tradeBtnHandler = openTradeModal;

  if (status === 'pending') {
    if (isInitiator) {
      tradeBtnLabel = '거래 대기중';
      tradeBtnDisabled = true;
      tradeBtnHandler = undefined;
    } else {
      tradeBtnLabel = '거래 수락하기';
      tradeBtnDisabled = false;
      tradeBtnHandler = handleAcceptClick;
    }
  } else if (status === 'in_progress') {
    if (amBuyer) {
      tradeBtnLabel = '거래 완료하기';
      tradeBtnDisabled = false;
      tradeBtnHandler = completeTrade;
    } else {
      tradeBtnLabel = '거래 중';
      tradeBtnDisabled = true;
      tradeBtnHandler = undefined;
    }
  } else if (status === 'completed') {
    tradeBtnLabel = '거래하기'; // 기본 버튼은 평상태로, 리뷰 버튼은 별도 표기
    tradeBtnDisabled = false;
    tradeBtnHandler = openTradeModal;
  } else if (status === 'cancelled') {
    tradeBtnLabel = '거래하기';
    tradeBtnDisabled = false;
    tradeBtnHandler = openTradeModal;
  }

  useEffect(() => {
    const currentUid = auth.currentUser?.uid;
    if (trade?.status === 'completed' && currentUid && trade?.buyerId === currentUid) {
      // 거래별로 유니크한 키: 채팅방 + 아이템 + 업데이트시각
      const key = `reviewHidden:${chatRoomId}:${trade?.item?.item_id || ''}:${trade?.updatedAt || ''}`;
      setReviewHideKey(key);
      const hidden = localStorage.getItem(key) === '1';
      setHideReviewCTA(!!hidden);
    } else {
      // completed가 아니거나, 내가 구매자가 아니면 리뷰 버튼 숨김 상태 초기화
      setReviewHideKey(null);
      setHideReviewCTA(false);
    }
  }, [trade?.status, trade?.buyerId, trade?.item?.item_id, trade?.updatedAt, auth.currentUser?.uid, chatRoomId]);



  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const db = getDatabase();
    const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
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
      {/* 상단: 상대방 아이디 + 거래 버튼 (디자인 영향 최소, 한 줄만 추가) */}
      <div style={styles.tradeHeader}>
        <div style={styles.tradeRight}>
          <button
            style={{
              ...styles.tradeButton,
              ...(tradeBtnDisabled ? styles.tradeButtonDisabled : {})
            }}
            onClick={tradeBtnHandler}
            disabled={tradeBtnDisabled || busy}
          >
            {tradeBtnLabel}
          </button>
          {/* 완료 후, 구매자에게만 리뷰 버튼 노출 */}
          {status === 'completed' && amBuyer && !hideReviewCTA && (
            <button
              style={{ ...styles.tradeButton, marginLeft: 8 }}
              onClick={handleReviewClick}
            >
              리뷰 작성하기
            </button>
          )}
        </div>
      </div>

      {/* 기존 메시지 리스트 */}
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

      {/* 입력창 */}
      <form style={styles.inputContainer} onSubmit={handleSendMessage}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          style={styles.input}
          rows="1"
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
        <button type="submit" style={styles.sendButton}><strong>전송</strong></button>
      </form>

      {/* 경량 모달 (디자인 영향 최소) */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {modalStep === 1 && (
              <>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>판매자인가요?</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={styles.tradeButton} onClick={() => selectRole('seller')}>예(판매자)</button>
                  <button style={styles.tradeButton} onClick={() => selectRole('buyer')}>아니요(구매자)</button>
                </div>
              </>
            )}

            {modalStep === 2 && (
              <>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  {role === 'seller' ? '판매하려는 물건을 고르세요' : '구매하려는 음식을 골라주세요'}
                </div>
                <div style={styles.modalList}>
                  {itemOptions.length === 0 && (
                    <div style={{ fontSize: 12, color: '#777' }}>표시할 상품이 없습니다.</div>
                  )}
                  {itemOptions.map((it) => (
                    <div
                      key={it.item_id}
                      style={{
                        ...styles.modalItem,
                        borderColor: selectedItem?.item_id === it.item_id ? '#ffc038' : '#eee',
                        background: selectedItem?.item_id === it.item_id ? '#fff8e6' : '#fff'
                      }}
                      onClick={() => setSelectedItem(it)}
                    >
                      <div style={{ fontWeight: 600 }}>{it.name}</div>
                      <div style={{ fontSize: 12, color: '#555' }}>{it.type} · {it.price}원</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button style={styles.tradeButton} onClick={() => setIsModalOpen(false)}>취소</button>
                  <button
                    style={{ ...styles.tradeButton, opacity: selectedItem ? 1 : 0.5 }}
                    onClick={goConfirm}
                    disabled={!selectedItem}
                  >
                    다음
                  </button>
                </div>
              </>
            )}

            {modalStep === 3 && selectedItem && (
              <>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>
                  “{selectedItem.name}”을(를) 거래하시겠습니까?
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={styles.tradeButton} onClick={confirmInitiateTrade}>예</button>
                  <button style={styles.tradeButton} onClick={() => setIsModalOpen(false)}>아니요</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {isReviewModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsReviewModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>리뷰 작성</div>
      
            {/* 별점 */}
            <div style={{ marginBottom: 10 }}>
              {[1,2,3,4,5].map(n => (
                <span
                  key={n}
                  onClick={() => setReviewRating(n)}
                  style={{ fontSize: 22, cursor: 'pointer', userSelect: 'none', marginRight: 4 }}
                >
                  {n <= reviewRating ? '★' : '☆'}
                </span>
              ))}
              <span style={{ marginLeft: 8, fontSize: 12, color: '#666' }}>{reviewRating} / 5</span>
            </div>
            
            {/* 내용 */}
            <textarea
              placeholder="내용을 입력하세요 (선택)"
              value={reviewText}
              onChange={(e)=> setReviewText(e.target.value)}
              style={{ width: '100%', minHeight: 80, border: '1px solid #ddd', borderRadius: 6, padding: 8, marginBottom: 8, resize: 'vertical' }}
            />

            {/* 이미지 URL (선택) */}
            <input
              type="text"
              placeholder="이미지 URL (선택)"
              value={reviewImage}
              onChange={(e)=> setReviewImage(e.target.value)}
              style={{ width: '100%', border: '1px solid #ddd', borderRadius: 6, padding: 8, marginBottom: 12 }}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                style={{ ...styles.tradeButton, backgroundColor: '#bbb' }}
                onClick={cancelReview}
                disabled={submittingReview}
              >
                나중에 할게요
              </button>
              <button
                style={styles.tradeButton}
                onClick={submitReview}
                disabled={submittingReview}
              >
                {submittingReview ? '등록 중...' : '등록'}
              </button>
            </div>
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
  // 상단 헤더
  tradeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    borderBottom: '1px solid #eee',
    background: '#fafafa'
  },
  tradeRight: {
    display: 'flex',
    alignItems: 'center'
  },
  tradeButton: {
    padding: '6px 10px',
    backgroundColor: '#ffc038',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: 12
  },
  tradeButtonDisabled: {
    backgroundColor: '#bbb',
    cursor: 'not-allowed'
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
    background: '#f3f3f3'
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
  },

  // 모달
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  modalContent: {
    width: '90%',
    maxWidth: 360,
    background: '#fff',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
  },
  modalList: {
    maxHeight: 220,
    overflowY: 'auto',
    border: '1px solid #eee',
    borderRadius: 6,
    padding: 6
  },
  modalItem: {
    border: '1px solid #eee',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    cursor: 'pointer'
  }
};

export default Chat;

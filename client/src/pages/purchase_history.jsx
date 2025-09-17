import React, { useState, useEffect } from "react"; 
import { useNavigate, useParams } from "react-router-dom"; 
import header from "../styles/PageHeader.module.css";
import recipeStyles from "../styles/MyRecipe.module.css";
import salesStyles from "../styles/SalesHistory.module.css"; // 새 CSS 모듈 import
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const Sales_History = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // (현재 미사용, 기존 변수 유지)
  const goBack = () => { navigate(-1); }
  const [authUser, setAuthUser] = useState(null);

  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // (현재 미사용, 기존 변수 유지)

  // ✅ 주문별 리뷰 존재 맵: { [order_id]: { exists: boolean, review_id?: string } }
  const [reviewMap, setReviewMap] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        alert('로그인이 필요합니다.');
        navigate('/');
        return;
      }
      try {
        setAuthUser(fbUser);
        const token = await fbUser.getIdToken();

        const res = await axios.get('/api/orders/buyer', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const orderData = res.data;
        
        if (!orderData || orderData.length === 0) {
          alert('주문 정보를 찾을 수 없습니다.');
          goBack();
          return;
        }

        const ordersWithProduct = await Promise.all(orderData.map(async (order) => {
          let product = null;
          let sellerNickname = null;
          try {
            // 상품 정보 가져오기
            const prodRes = await axios.get(`/api/products/${order.item_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            product = prodRes.data;
          } catch (e) {
            product = null;
          }
          try {
            // 판매자 닉네임 가져오기
            const userRes = await axios.get(`/api/users/nickname/${order.seller_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            sellerNickname = userRes.data.nickname;
          } catch (e) {
            sellerNickname = null;
          }
          return { ...order, product, seller_nickname: sellerNickname };
        }));

        setOrderList(ordersWithProduct);

        // ✅ 주문별 리뷰 존재 여부 조회 후 맵 구성
        const pairs = await Promise.all(
          ordersWithProduct.map(async (o) => {
            try {
              const r = await axios.get(`/api/reviews/exists/${o.order_id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return [o.order_id, r.data]; // { exists, review_id }
            } catch {
              return [o.order_id, { exists: false, review_id: null }];
            }
          })
        );
        setReviewMap(Object.fromEntries(pairs));

      } catch (err) {
        console.error(err);
        alert('주문 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);
  
  // 그룹화 함수 (현재 사용 예시 동일하게 유지)
  function groupByItemId(orderList) {
    return orderList.reduce((acc, order) => {
      const key = order.item_id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(order);
      return acc;
    }, {});
  }

  const handleConfirmPurchase = async (orderId) => {
    try {
      // 서버에 구매확정 상태 변경 요청
      await axios.patch(`/api/orders/${orderId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${authUser && await authUser.getIdToken()}` }
      });

      // 프론트엔드 상태 업데이트
      setOrderList(prev =>
        prev.map(order =>
          order.order_id === orderId
            ? { ...order, status: 'completed' }
            : order
        )
      );

      alert('구매확정 처리되었습니다.');
    } catch (err) {
      alert('구매확정 처리에 실패했습니다.');
    }
  };

  // 사용 예시
  const groupedOrders = groupByItemId(orderList);

  // 열린 그룹 관리 (현재 미사용 로직 유지)
  const [openGroups, setOpenGroups] = useState({});

  return (
    <div className={`${header.wrapper} ${salesStyles.wrapper}`}> 
      <div className={header.header}> 
        <div className={header.backButton} onClick={goBack}>←</div> 
        <div className={salesStyles.centerTitle}>구매 내역</div> 
      </div>
      
      <div className={salesStyles.contentContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>로딩 중...</div>
        ) : orderList.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>구매 내역이 없습니다.</div>
        ) : (
          <div className={salesStyles.orderList}>
            {orderList.map(order => {
              const reviewed = reviewMap[order.order_id]?.exists;
              const reviewId = reviewMap[order.order_id]?.review_id;
              const isCompleted = order.status === 'completed';

              return (
                <div key={order.order_id} className={recipeStyles.recipeCard}>
                  <div className={recipeStyles.recipeInfo}>
                    <div className={recipeStyles.recipeText}>
                      <h3 className={recipeStyles.recipeTitle}>
                        {order.seller_nickname ? order.seller_nickname : order.seller_id} 님
                      </h3>
                      <h3 className={recipeStyles.recipeTitle}>
                        {order.product ? order.product.name : order.item_name}
                      </h3>
                      <p className={recipeStyles.recipeDescription}>
                        주문일: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className={recipeStyles.recipeDescription}>
                        {order.status === 'pending' ? '거래 대기'
                          : isCompleted ? '거래 완료'
                          : order.status === 'cancelled' ? '거래 취소' : order.status}
                      </p>
                    </div>
                  </div>
                  
                  <div className={recipeStyles.buttonContainer}>
                    <button
                      className={salesStyles.chatButton}
                      onClick={() => navigate(`/chat/${order.seller_id}`)}
                    >
                      채팅하기
                    </button>

                    {/* ✅ 완료된 주문만 리뷰 가능 / 주문당 1회 (동일 메뉴여도 각 주문은 각각 작성 가능) */}
                    {isCompleted ? (
                      reviewed ? (
                        <button
                          className={salesStyles.chatButton}
                          onClick={() => reviewId ? navigate(`/review/edit/${reviewId}`) : null}
                        >
                          리뷰수정
                        </button>
                      ) : (
                        <button
                          className={salesStyles.chatButton}
                          onClick={() => navigate(`/review/${order.order_id}`)}
                        >
                          리뷰하기
                        </button>
                      )
                    ) : (
                      <button
                        className={salesStyles.chatButton}
                        onClick={() => handleConfirmPurchase(order.order_id)}
                      >
                        구매확정
                      </button>
                    )}
                  </div>

                  <div className={recipeStyles.divider}></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales_History;

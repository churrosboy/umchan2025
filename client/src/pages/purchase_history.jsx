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
  const [user, setUser] = useState(null);
  const goBack = () => { navigate(-1); }
  const [authUser, setAuthUser] = useState(null);

  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            // 구매자 닉네임 가져오기
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

      } catch (err) {
        console.error(err);
        alert('주문 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);
  
  // 그룹화 함수
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

  // 열린 그룹 관리
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
            {orderList.map(order => (
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
                      {order.status === 'pending' ? '거래 대기' : order.status === 'completed' ? '거래 완료' : order.status === 'cancelled' ? '거래 취소' : order.status}
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
                  {order.status === 'completed' ? (
                    <button
                      className={salesStyles.chatButton}
                      onClick={() => navigate(`/review/${order.order_id}`)}
                    >
                      리뷰하기
                    </button>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales_History;

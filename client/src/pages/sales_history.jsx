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

        const res = await axios.get('/api/orders/seller', {
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
          let buyerNickname = null;
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
            const userRes = await axios.get(`/api/users/nickname/${order.buyer_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            buyerNickname = userRes.data.nickname;
          } catch (e) {
            buyerNickname = null;
          }
          return { ...order, product, buyer_nickname: buyerNickname };
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

  // 사용 예시
  const groupedOrders = groupByItemId(orderList);

  // 열린 그룹 관리
  const [openGroups, setOpenGroups] = useState({});

  // 그룹 헤더 클릭 시 토글
  const handleToggleGroup = (itemId) => {
    setOpenGroups(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <div className={`${header.wrapper} ${salesStyles.wrapper}`}> 
      <div className={header.header}> 
        <div className={header.backButton} onClick={goBack}>←</div> 
        <div className={header.title}>판매 내역</div> 
      </div>
      
      <div className={salesStyles.contentContainer}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>로딩 중...</div>
        ) : orderList.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>판매 내역이 없습니다.</div>
        ) : (
          Object.entries(groupedOrders).map(([itemId, orders]) => (
            <div key={itemId} className={recipeStyles.itemGroup}>
              <div
                className={salesStyles.groupHeader}
                onClick={() => handleToggleGroup(itemId)}
              >
                <div className={salesStyles.headerContent}>
                  <div className={salesStyles.imageContainer}>
                    {orders[0].product && orders[0].product.images && orders[0].product.images.length > 0 ? (
                      <img
                        src={orders[0].product.images[0]}
                        alt={orders[0].product.name}
                        className={salesStyles.productImage}
                      />
                    ) : (
                      <div className={salesStyles.productImage}>이미지 없음</div>
                    )}
                  </div>
                  
                  <div className={salesStyles.productInfo}>
                    <div className={salesStyles.productName}>
                      {orders[0].product?.name || itemId}  <span style={{fontSize: '13px'}}>{orders[0].product ? orders[0].product.price : orders[0].price}원</span>
                    </div>
                    <div className={salesStyles.productType}>
                      {orders[0].product?.reserve_end ? ' 즉시 판매 상품' : ` 예약 판매 상품 | ${new Date(orders[0].product.reserve_end).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
                
                <div>
                  <span className={salesStyles.arrowIcon}>
                    {openGroups[itemId] ? '▲' : '▼'}
                  </span>
                </div>
              </div>
              
              <div className={`
                ${salesStyles.groupContent}
                ${openGroups[itemId] ? salesStyles.groupContentOpen : salesStyles.groupContentClosed}
              `}>
                {orders.map(order => (
                  <div key={order.order_id} className={recipeStyles.recipeCard}>
                    <div className={recipeStyles.recipeInfo}>
                      <div className={recipeStyles.recipeText}>
                        <h3 className={recipeStyles.recipeTitle}>
                          {order.buyer_nickname ? order.buyer_nickname : order.buyer_id} 님
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
                      <button className={salesStyles.chatButton} onClick={() => navigate(`/chat/${order.buyer_id}`)}>채팅하기</button>
                    </div>
                    <div className={recipeStyles.divider}></div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div> 
    </div> 
  ); 
};

export default Sales_History;

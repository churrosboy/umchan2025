import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/SellerDetail.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { FaStar, FaHeart, FaArrowLeft } from 'react-icons/fa';

const SellerDetail = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoadingError('로그인이 필요합니다.');
        return;
      }
      try {
        const token = await user.getIdToken();
        setAuthToken(token);
      } catch (error) {
        console.error('토큰 발급 실패:', error);
        setLoadingError('인증에 실패했습니다.');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authToken) return;
    const fetchData = async () => {
      setLoading(true);
      setLoadingError(null);
      try {
        const [userRes, productRes] = await Promise.all([
          axios.get(`/api/users/${sellerId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          }),
          axios.get(`/api/products/user/${sellerId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          })
        ]);
        setSeller(userRes.data);
        setProducts(Array.isArray(productRes.data) ? productRes.data : []);
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
        setLoadingError(
          err.response?.status === 401
            ? '접근 권한이 없습니다.'
            : '판매자 정보를 불러오지 못했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authToken, sellerId]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <FaArrowLeft />
          </button>
          <div className={styles.title}>판매자 정보</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className={styles.loadingSpinner}></div>
            <p style={{ marginTop: 16 }}>판매자 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingError || !seller) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <FaArrowLeft />
          </button>
          <div className={styles.title}>문제가 발생했습니다</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, marginBottom: 16 }}>{loadingError || '판매자를 찾을 수 없습니다.'}</p>
            <button 
              onClick={() => navigate('/')} 
              style={{ 
                padding: '8px 16px', 
                background: '#3182CE', 
                color: 'white', 
                border: 'none', 
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reviewCount = seller.review_cnt || 0;
  const avg = Number(parseFloat(seller.avg_rating || 0).toFixed(1));
  const hasReviews = reviewCount > 0;

  const instantProducts = products.filter(product => product.type === '즉시' || product.type === '즉시구매');
  const reservationProducts = products.filter(product => product.type === '예약' || product.type === '예약구매');

  const goReviews = () => {
    if (hasReviews) navigate(`/user_review_list/${seller.id}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FaArrowLeft />
        </button>
        <div className={styles.title}>판매자 정보</div>
      </div>

      <div className={styles.imageBox}>
        {seller.profile_img ? (
          <img src={seller.profile_img} alt={`${seller.nickname} 프로필`} />
        ) : (
          <div className={styles.imagePlaceholder}>프로필 이미지가 없습니다</div>
        )}
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.sellerInfo}>
          <h2
            className={styles.sellerName}
            onClick={() => navigate(`/other_user_profile/${seller.id}`)}
          >
            {seller.nickname}
          </h2>

          {/* ⭐ 별점/좋아요 영역: 클릭 불가, 정보만 */}
          <div className={styles.infoRowStatic}>
            <div className={styles.infoStaticBlock}>
              <FaStar className={styles.infoIcon} />
              <span className={styles.scoreText}>{avg.toFixed(1)}</span>
              <span className={styles.countText}>({reviewCount})</span>
            </div>
            <div className={styles.dot} aria-hidden="true">•</div>
            <div className={styles.heartWrap}>
              <FaHeart className={styles.heartIcon} />
              <span>{seller.like_cnt || 0}</span>
            </div>
          </div>

          {/* 🔶 별(노랑 칩) 디자인으로 바꾼 “리뷰 N개 보기” 버튼 */}
          {hasReviews ? (
            <button type="button" className={styles.reviewPillYellow} onClick={goReviews}>
              리뷰 {reviewCount}개 보기
            </button>
          ) : (
            <div className={styles.reviewEmptyHint}>아직 받은 리뷰가 없어요</div>
          )}

          {seller.intro && (
            <p style={{ textAlign: 'center', margin: '16px 0', color: '#555', fontSize: 15 }}>
              {seller.intro}
            </p>
          )}
        </div>

        <div className={styles.divider}></div>

        <h3 className={styles.sectionTitle}>즉시구매 상품</h3>
        {instantProducts.length > 0 ? (
          <div className={styles.menuContainer}>
            {instantProducts.map(product => (
              <div
                key={product.item_id}
                className={styles.menuCard}
                onClick={() => navigate(`/menu/${product.item_id}`)}
              >
                <div className={styles.menuImageWrapper}>
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className={styles.menuImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className={styles.menuNoImage}>
                      <span>이미지 없음</span>
                    </div>
                  )}
                </div>
                <div className={styles.menuContent}>
                  <strong>{product.name}</strong>
                  <p>{product.info}</p>
                  <p className={styles.menuCardPrice}>{Number(product.price).toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noProducts}>즉시구매 상품이 없습니다.</p>
        )}

        <h3 className={styles.sectionTitle}>예약구매 상품</h3>
        {reservationProducts.length > 0 ? (
          <div className={styles.menuContainer}>
            {reservationProducts.map(product => (
              <div
                key={product.item_id}
                className={styles.menuCard}
                onClick={() => navigate(`/menu/${product.item_id}`)}
              >
                <div className={styles.menuImageWrapper}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className={styles.menuImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className={styles.menuNoImage}>
                      <span>이미지 없음</span>
                    </div>
                  )}
                </div>
                <div className={styles.menuContent}>
                  <strong>{product.name}</strong>
                  <p>{product.info}</p>
                  <p className={styles.menuCardPrice}>{Number(product.price).toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noProducts}>예약구매 상품이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default SellerDetail;

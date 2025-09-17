import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './SellerList.module.css';
const API_URL = process.env.REACT_APP_API_URL;

const SellerList = () => {
  const navigate = useNavigate();
  const { keyword } = useParams();

  const [seller_result, setSeller_result] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/search/product?keyword=${keyword}`);
        const data = await response.json();
        setSeller_result(data);
      } catch (err) {
        setSeller_result([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [keyword]);

  if (loading) return <div style={styles.searchPage}>로딩 중...</div>;

  if (!seller_result.length) return <div style={styles.searchPage}>판매자를 찾을 수 없습니다.</div>;

  return (
    <div style={styles.searchPage}>
      <div style={styles.resultSummary}>
        <h3 style={styles.resultTitle}>"{keyword}" 검색 결과</h3>
        <p style={styles.resultCount}>{seller_result.length}개의 가게를 찾았습니다</p>
      </div>

      {/* 판매자 리스트 */}
      <div style={styles.sellerList}>
        {seller_result.map((seller) => (
          <div style={styles.sellerCard} key={seller.id} onClick={() => navigate(`/seller_detail/${seller.id}`)}>
            <div style={styles.thumbnail}>{seller.main_img && seller.main_img[0] ? (<img src={seller.main_img[0]} alt={seller.nickname} style={styles.thumbnailImg} />) : ('이미지 없음')}</div>
            <div style={styles.sellerInfo}>
              <div style={styles.top}>
                <span style={styles.name}>{seller.nickname}</span>
                <span style={styles.rating}>⭐ {seller.avg_rating} ({seller.review_cnt})</span>
                <span style={styles.likes}>💚 {seller.like_cnt}</span>
              </div>
              <div style={styles.matchingProducts}>
                {seller.matchingProducts.slice(0, 2).map((product, idx) => (
                  <span key={product.item_id} style={styles.matchingProduct}>
                    {product.name}
                    {idx < Math.min(seller.matchingProducts.length, 2) - 1 && idx < 1 ? ', ' : ''}
                  </span>
                ))}
                {seller.matchingProducts.length > 2 && (
                  <span style={styles.moreProducts}>
                    {` 외 ${seller.matchingProducts.length - 2}개`}
                  </span>
                )}
              </div>
              <div style={styles.distance}>거래장소가 00m 이내에요!</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerList;
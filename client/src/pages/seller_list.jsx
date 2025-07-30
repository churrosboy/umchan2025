import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';
import { products } from '../data/products';

const SellerList = () => {
    const navigate = useNavigate();

    const { keyword } = useParams();

    const product_result = products.filter(product => product.name.toLowerCase().includes(keyword.toLowerCase()));

    const seller_result = sellers.map(seller => {
        const matchingProducts = product_result.filter(product => 
            product.sellerId === seller.id
        );
        
        if (matchingProducts.length > 0) {
            return {
                ...seller,
                matchingProducts: matchingProducts
            };
        }
        return null;
    }).filter(Boolean);

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
                <div style={styles.thumbnail}>{seller.images ? (<img src={seller.images[0]} alt={seller.name} style={styles.thumbnailImg} />) : ('이미지 없음')}</div>
                <div style={styles.sellerInfo}>
                <div style={styles.top}>
                    <span style={styles.name}>{seller.name}</span>
                    <span style={styles.rating}>⭐ {seller.rating} ({seller.reviews})</span>
                    <span style={styles.likes}>💚 {seller.hearts}</span>
                </div>
                <div style={styles.matchingProducts}>
                    {seller.matchingProducts.slice(0, 2).map((product, idx) => (
                        <span key={product.id} style={styles.matchingProduct}>
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

const styles = {
  searchPage: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: 'sans-serif',
    background: '#fff',
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '60px', /* for nav */
    paddingTop: '70px', /* for nav */
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    borderBottom: '1px solid #ddd',
  },
  searchInput: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    border: 'none',
    background: '#f5f5f5',
    borderRadius: '6px',
  },
  iconX: {
    marginLeft: '8px',
    fontSize: '20px',
    color: '#666',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px',
    borderBottom: '1px solid #eee',
    background: '#fafafa',
  },
  filterBtn: {
    fontSize: '14px',
    border: 'none',
    background: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#333',
  },
  sellerList: {
    padding: '10px',
    cursor: 'pointer',
  },
  sellerCard: {
    display: 'flex',
    borderBottom: '1px solid #eee',
    padding: '10px 0',
  },
  thumbnail: {
    width: '80px',
    height: '80px',
    background: '#ccc',
    borderRadius: '6px',
    textAlign: 'center',
    lineHeight: '80px',
    fontSize: '12px',
    marginRight: '12px',
    color: 'white',
  },
  sellerInfo: {
    flex: 1,
    fontSize: '14px',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  name: {
    fontWeight: 'bold',
  },
  rating: {
    color: '#f5a623',
  },
  likes: {
    fontSize: '13px',
    color: '#23a34a',
  },
  tags: {
    color: '#666',
    fontSize: '13px',
  },
  distance: {
    color: '#aaa',
    fontSize: '12px',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px',
  },
  matchingProducts: {
        fontSize: '13px',
        color: '#333',
        margin: '4px 0',
    },
    matchingProduct: {
        color: '#f5a623',
        fontWeight: 'bold',
    },
    moreProducts: {
        fontSize: '12px',
        color: '#888',
    },
    thumbnailImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '6px',
    },
};

export default SellerList;
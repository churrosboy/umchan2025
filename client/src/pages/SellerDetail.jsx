import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';

const SellerDetail = () => {
  const { sellerId } = useParams();
  const seller = sellers.find(s => s.id === Number(sellerId));
  const navigate = useNavigate();

  if (!seller) return <div>판매자를 찾을 수 없습니다.</div>;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>&lt; 뒤로가기</button>
      <h2>{seller.name}</h2>
      <p>⭐ {seller.rating} ({seller.reviews}) 💚 {seller.hearts}</p>
      <div style={{ width: '100%', height: 200, background: '#eee', margin: '10px 0' }}>
        지도 삽입
      </div>
      <h3>즉시구매 상품</h3>
      {seller.sellingType === 'immediate' && seller.menus.map(menu => (
        <div key={menu.id} onClick={() => navigate(`/menu/${menu.id}`)} style={{ background: '#f8f8f8', margin: 10, padding: 10 }}>
          <strong>{menu.name}</strong>
          <p>{menu.desc}</p>
        </div>
      ))}

      <h3>예약구매 상품</h3>
      {seller.sellingType === 'reservation' && seller.menus.map(menu => (
        <div key={menu.id} onClick={() => navigate(`/menu/${menu.id}`)} style={{ background: '#f8f8f8', margin: 10, padding: 10 }}>
          <strong>{menu.name}</strong>
          <p>{menu.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default SellerDetail;

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';

const MenuDetail = () => {
  const { menuId } = useParams();
  const navigate = useNavigate();

  let menu = null;
  sellers.forEach(s => {
    s.menus.forEach(m => {
      if (m.id === Number(menuId)) menu = m;
    });
  });

  if (!menu) return <div>메뉴를 찾을 수 없습니다.</div>;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>&lt; 뒤로가기</button>
      <div style={{ width: '100%', height: 200, background: '#ddd', marginBottom: 20 }}>
        상세사진 영역
      </div>
      <h2>{menu.name}</h2>
      <p>{menu.price.toLocaleString()}원</p>
      <p>{menu.desc}</p>
      <button style={{ background: '#fcd265', padding: '10px 20px', border: 'none', borderRadius: 8 }}>채팅하기</button>
    </div>
  );
};

export default MenuDetail;

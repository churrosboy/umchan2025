import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiHome,
  HiBookOpen,
  HiChatBubbleLeftRight,
  HiShoppingCart,
  HiUser,
} from 'react-icons/hi2';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: '홈', icon: <HiHome size={22} />, path: '/home' },
    { label: '레시피', icon: <HiBookOpen size={22} />, path: '/recipes' },
    { label: '채팅', icon: <HiChatBubbleLeftRight size={22} />, path: '/chat' },
    { label: '장바구니', icon: <HiShoppingCart size={22} />, path: '/cart' },
    { label: '내정보', icon: <HiUser size={22} />, path: '/profile' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      height: '60px',
      background: '#fff',
      borderTop: '1px solid #ccc',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
    }}>
      {items.map(item => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: location.pathname === item.path ? '#fcd265' : '#444',
            fontSize: 12,
          }}
        >
          {item.icon}
          <span style={{ marginTop: 2 }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default NavigationBar;

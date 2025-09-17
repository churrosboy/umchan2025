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
    { label: '채팅', icon: <HiChatBubbleLeftRight size={22} />, path: '/chats' },
    { label: '장바구니', icon: <HiShoppingCart size={22} />, path: '/cart' },
    { label: '내정보', icon: <HiUser size={22} />, path: '/profile' },
  ];

  return (
    <div className="navigationContainer">
      {items.map(item => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className="navigationBar"
          style={{ color: location.pathname === item.path ? '#fcd265' : '#444' }}
        >
          {item.icon}
          <span style={{ marginTop: 2 }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default NavigationBar;

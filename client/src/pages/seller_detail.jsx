import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/SellerDetail.module.css'; //스타일 가져오는 부분
import { ReactComponent as Star } from '../Icons/Star01.svg';
import { ReactComponent as Heart } from '../Icons/Heart01.svg';
const API_URL = process.env.REACT_APP_API_URL;

const SellerDetail = () => {
  const { sellerId } = useParams(); //홈화면에서 선택된 판매자의 Id를 가져오는 부분
  const navigate = useNavigate();
  
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, productRes] = await Promise.all([
          fetch(`${API_URL}/api/users/${sellerId}`),
          fetch(`${API_URL}/api/products/user/${sellerId}`)
        ]);
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setSeller(userData);
        }
        
        if (productRes.ok) {
          const productData = await productRes.json();
          setProducts(productData);
        }
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [sellerId]);

  if (loading) return <div>로딩 중...</div>;
  if (!seller) return <div>판매자를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrapper}>
      {/*뒤로가기 버튼*/}
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        &lt; 뒤로가기
      </button>

      {/*판매자 닉네임 부분. 클릭 시 판매자의 프로필로 이동.*/}
      <h2 onClick={() => navigate(`/other_user_profile/${seller.id}`)}>{seller.name}</h2>
      <p className={styles.info}>
        <Star width={17} height={17} style={{ verticalAlign: 'middle' }}/>
        {seller.rating} ({seller.reviews})
        <Heart width={19} height={19} style={{ verticalAlign: 'middle' }}/>
        {seller.hearts}
      </p>

      {/*즉시구매 상품란/sellingType에 따라 표시되는 상품 구분*/}
      <h3 className={styles.sectionTitle}>즉시구매 상품</h3>
      {seller.sellingType === 'immediate' &&
        seller.menus.map(menu => (
          <div
            key={menu.id}
            className={styles.menuCard}
            onClick={() => navigate(`/menu/${menu.id}`)}
          >
            <strong>{menu.name}</strong>
            <p>{menu.desc}</p>
          </div>
        ))}

      {/*예약구매 상품란*/}
      <h3 className={styles.sectionTitle}>예약구매 상품</h3>
      {seller.sellingType === 'reservation' &&
        seller.menus.map(menu => (
          <div
            key={menu.id}
            className={styles.menuCard}
            onClick={() => navigate(`/menu/${menu.id}`)}
          >
            <strong>{menu.name}</strong>
            <p>{menu.desc}</p>
          </div>
        ))}
    </div>
  );
};

export default SellerDetail;

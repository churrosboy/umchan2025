import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/MenuDetail.module.css';
const API_URL = process.env.REACT_APP_API_URL;

const MenuDetail = () => {
  const { menuId } = useParams(); //이전 화면에서 선택된 메뉴Id를 가져오는 부분
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/products/${menuId}`);

        if (!response.ok) {
          throw new Error('상품을 찾을 수 없습니다.');
        }
        
        const data = await response.json();
        setProduct(data);
        setCurrentImageIndex(0); // 새 상품 로드 시 첫 번째 이미지로 리셋
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (menuId) {
      fetchProduct();
    }
  }, [menuId]);

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) return <div className={styles.wrapper}>로딩 중...</div>;
  if (error) return <div className={styles.wrapper}>에러: {error}</div>;
  if (!product) return <div className={styles.wrapper}>메뉴를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.wrapper}>
      {/*뒤로가기 버튼*/}
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        &lt; 뒤로가기
      </button>

      {/*메뉴 이미지*/}
      <div className={styles.imageBox}>상세사진 영역</div>

      {/*메뉴 정보란*/}
      <h2 className={styles.name}>{menu.name}</h2>
      <p className={styles.price}>{menu.price.toLocaleString()}원</p>
      <p className={styles.desc}>{menu.desc}</p>

      {/*채팅하기 버튼*/}
      <button className={styles.chatButton}>채팅하기</button>
    </div>
  );
};

export default MenuDetail;
/*스타일은 styles 폴더의 MenuDetail.module.css 파일 확인*/

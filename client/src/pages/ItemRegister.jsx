import React, { useState, useEffect } from 'react';
import { HiPhoto, HiChevronRight, HiMiniXCircle } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import styles from './Item.module.css';
const API_URL = process.env.REACT_APP_API_URL;

const ItemRegister = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const [authUser, setAuthUser] = useState(null);
  const [User, setUser] = useState(null);

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

        // 서버에서 사용자 정보 가져오기
        const res = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const userData = await res.json();
        if (!userData?.user) {
          alert('사용자 정보를 찾을 수 없습니다.');
          return;
        }

        setUser(userData.user);
      } catch (err) {
        console.error('사용자 정보 불러오기 실패:', err);
        alert('사용자 정보를 불러올 수 없습니다.');
      }
    });

    return () => unsub();
  }, [navigate]);

  // 여러 이미지 업로드 지원
  const [images, setImages] = useState([]);
  const [item, setItem] = useState({
    name: '',
    type: '즉시', // 즉시 or 예약
    price: '',
    info: '',
    reserve_end: '',
  });

  // 이미지 추가
  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };
  const removeImage = idx => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  // 입력값 변경
  const handleChange = e => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: value }));
  };

  // 등록
  const handleSubmit = async () => {
    if (!User) {
      alert('사용자 정보가 없습니다. 다시 로그인해주세요.');
      navigate('/');
      return;
    }
    if (!item.name.trim()) {
      alert('상품명을 입력하세요.');
      return;
    }
    if (!item.price || isNaN(Number(item.price))) {
      alert('가격을 숫자로 입력하세요.');
      return;
    }
    if (!item.info.trim()) {
      alert('상품 설명을 입력하세요.');
      return;
    }
    // FormData로 전송
    const formData = new FormData();
    formData.append('user_id', User.id.toString()); // 실제 로그인 유저 ID로 변경
    formData.append('name', item.name);
    formData.append('type', item.type);
    formData.append('price', item.price);
    formData.append('info', item.info);
    formData.append('reserve_end', item.reserve_end || '0');
    images.forEach((img, idx) => {
      formData.append('images', img);
    });
    try {
      const response = await fetch(`/api/products`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        alert('판매 품목 등록 성공!');
        navigate('/profile');
      } else {
        alert('등록 실패');
      }
    } catch (err) {
      alert('에러 발생');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.backButton} onClick={goBack}>←</div>
        <div className={styles.headerTitle}>판매 품목 등록</div>
        <div className={styles.headerSpacer} />
      </div>
      <div className={styles.container}>
        {/* 이미지 업로드 */}
        <div className={styles.uploadSection}>
          <label className={styles.photoLabel}>
            <input
              type="file"
              className={styles.photoInput}
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <HiPhoto size={28} className={styles.stepIcon} />
          </label>
          <div className={styles.uploadLabel}>상품 사진 등록 (여러 장 가능)</div>
        </div>
        {/* 이미지 미리보기 및 삭제 */}
        <div className={styles.previewGrid}>
          {images.map((img, idx) => (
            <div key={idx} className={styles.previewItem}>
              <img src={URL.createObjectURL(img)} alt="item" className={styles.previewImg} />
              <HiMiniXCircle className={styles.removeIcon} onClick={() => removeImage(idx)} />
            </div>
          ))}
        </div>
        {/* 상품명 */}
        <div className={styles.inputSection}>
          <div className={styles.inputTitle}>상품명</div>
          <input
            className={styles.inputField}
            type="text"
            name="name"
            value={item.name}
            onChange={handleChange}
            placeholder="상품명을 입력하세요"
          />
        </div>
        {/* 판매 방식 */}
        <div className={styles.inputSection}>
          <div className={styles.inputTitle}>판매 방식</div>
          <select name="type" value={item.type} onChange={handleChange} className={styles.inputField}>
            <option value="즉시">즉시 판매</option>
            <option value="예약">예약 판매</option>
          </select>
        </div>
        {/* 가격 */}
        <div className={styles.inputSection}>
          <div className={styles.inputTitle}>가격</div>
          <input
            className={styles.inputField}
            type="number"
            name="price"
            value={item.price}
            onChange={handleChange}
            placeholder="가격을 입력하세요"
          />
        </div>
        {/* 예약 마감 */}
        <div className={styles.inputSection}>
          <div className={styles.inputTitle}>예약 마감 시간</div>
          <input
            className={styles.inputField}
            type="datetime-local"
            name="reserve_end"
            value={item.reserve_end}
            onChange={handleChange}
            disabled={item.type !== '예약'}
          />
        </div>
        {/* 설명 */}
        <div className={styles.inputSection}>
          <div className={styles.inputTitle}>상품 설명</div>
          <textarea
            className={styles.inputField}
            name="info"
            value={item.info}
            onChange={handleChange}
            placeholder="상품 설명을 입력하세요"
          />
        </div>
        <div className={styles.margin2}></div>
        <button className={styles.submitButton} onClick={handleSubmit}>
          등록<HiChevronRight className={styles.nextIcon} />
        </button>
        <div className={styles.margin}></div>
      </div>
    </div>
  );
};

export default ItemRegister;

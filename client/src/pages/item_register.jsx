import React, { useState } from 'react';
import { HiPhoto, HiChevronRight, HiMiniXCircle } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;

const ItemRegister = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

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
    formData.append('user_id', '123'); // 실제 로그인 유저 ID로 변경
    formData.append('name', item.name);
    formData.append('type', item.type);
    formData.append('price', item.price);
    formData.append('info', item.info);
    formData.append('reserve_end', item.reserve_end || '0');
    images.forEach((img, idx) => {
      formData.append('images', img);
    });
    try {
      const response = await fetch(`${API_URL}/api/products`, {
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
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.backButton} onClick={goBack}>←</div>
        <div style={styles.headerTitle}>판매 품목 등록</div>
        <div style={styles.headerSpacer} />
      </div>
      <div style={styles.container}>
        {/* 이미지 업로드 */}
        <div style={styles.uploadSection}>
          <label style={styles.photoLabel}>
            <input
              type="file"
              style={styles.photoInput}
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <HiPhoto size={28} style={styles.stepIcon} />
          </label>
          <div style={styles.uploadLabel}>상품 사진 등록 (여러 장 가능)</div>
        </div>
        {/* 이미지 미리보기 및 삭제 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {images.map((img, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <img src={URL.createObjectURL(img)} alt="item" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
              <HiMiniXCircle style={{ position: 'absolute', top: 2, right: 2, fontSize: 18, color: '#888', cursor: 'pointer' }} onClick={() => removeImage(idx)} />
            </div>
          ))}
        </div>
        {/* 상품명 */}
        <div style={styles.inputSection}>
          <div style={styles.inputTitle}>상품명</div>
          <input
            style={styles.inputField}
            type="text"
            name="name"
            value={item.name}
            onChange={handleChange}
            placeholder="상품명을 입력하세요"
          />
        </div>
        {/* 판매 방식 */}
        <div style={styles.inputSection}>
          <div style={styles.inputTitle}>판매 방식</div>
          <select name="type" value={item.type} onChange={handleChange} style={styles.inputField}>
            <option value="즉시">즉시 판매</option>
            <option value="예약">예약 판매</option>
          </select>
        </div>
        {/* 가격 */}
        <div style={styles.inputSection}>
          <div style={styles.inputTitle}>가격</div>
          <input
            style={styles.inputField}
            type="number"
            name="price"
            value={item.price}
            onChange={handleChange}
            placeholder="가격을 입력하세요"
          />
        </div>
        {/* 예약 마감 */}
        <div style={styles.inputSection}>
          <div style={styles.inputTitle}>예약 마감 시간</div>
          <input
            style={styles.inputField}
            type="datetime-local"
            name="reserve_end"
            value={item.reserve_end}
            onChange={handleChange}
            disabled={item.type !== '예약'}
          />
        </div>
        {/* 설명 */}
        <div style={styles.inputSection}>
          <div style={styles.inputTitle}>상품 설명</div>
          <textarea
            style={{ ...styles.inputField, height: 80, resize: 'vertical' }}
            name="info"
            value={item.info}
            onChange={handleChange}
            placeholder="상품 설명을 입력하세요"
          />
        </div>
        <div style={styles.margin2}></div>
        <button style={styles.submitButton} onClick={handleSubmit}>
          등록<HiChevronRight style={styles.nextIcon} />
        </button>
        <div style={styles.margin}></div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: '#fff', borderBottom: '1px solid #ddd', position: 'relative', zIndex: 1 },
  backButton: { fontSize: 18, cursor: 'pointer' },
  headerTitle: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: 16 },
  headerSpacer: { width: 18 },
  container: { flex: 1, backgroundColor: '#fff', padding: '16px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  uploadSection: { backgroundColor: '#FEFEFE', borderRadius: 15, padding: '12px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #E6E6E6' },
  uploadIcon: { color: '#888888' },
  uploadLabel: { fontSize: 17, fontWeight: 600, color: 'black' },
  inputSection: { backgroundColor: '#FEFEFE', borderRadius: 15, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #E6E6E6' },
  inputSectionIngredient: { borderRadius: 15, display: 'flex', flexDirection: 'column', gap: '8px' },
  inputTitle: { fontSize: 16, fontWeight: 600, color: '#111111' },
  inputField: { height: 40, borderRadius: 15, border: '0.5px solid #888888', padding: '0 12px', fontSize: 14 },
  descriptionSection: { padding: '0 12px' },
  descriptionLabel: { fontSize: 17, fontWeight: 600, color: 'black' },
  stepsSection: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' },
  stepWrapper: { position: 'relative' },
  removeIcon: { position: 'absolute', top: '4px', right: '4px', fontSize: 16, color: '#888888', cursor: 'pointer' },
  stepCard: { backgroundColor: '#FEFEFE', borderRadius: 15, padding: '12px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #E6E6E6' },
  photoLabel: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, backgroundColor: '#DDD', borderRadius: 6, overflow: 'hidden', cursor: 'pointer' },
  photoInput: { display: 'none' },
  photoPreview: { width: '100%', height: '100%', objectFit: 'cover' },
  stepIcon: { color: '#888888' },
  stepInput: { flex: 1, height: 40, borderRadius: 15, border: '0.5px solid #888888', padding: '0 12px', fontSize: 14 },
  addButton: { marginTop: '8px', backgroundColor: '#fff', border: '1px solid #888888', borderRadius: 15, padding: '8px 12px', fontSize: 14, cursor: 'pointer', alignSelf: 'center' },
  submitButton: { marginTop: 'auto', backgroundColor: '#FFD856', borderRadius: 15, padding: '12px', fontSize: 16, fontWeight: 600, color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', gap: '8px' },
  nextIcon: { fontSize: 20, color: '#888888' },
  margin2: {padding: '4px'},
  margin: {padding: '40px'}
};

export default ItemRegister;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './PostReview.module.css';
const API_URL = process.env.REACT_APP_API_URL;

const ReviewPost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { item_id, seller_id, writer_id } = location.state || {};

  const [image, setImage] = useState(null); // 미리보기용 URL
  const [imageFile, setImageFile] = useState(null); // 실제 파일 객체
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // 파일 객체 저장
      setImage(URL.createObjectURL(file)); // 미리보기용 URL 생성
    }
  };

  const handleSubmit = async () => {
    try {
      // 1. 이미지 파일을 먼저 업로드하고 URL을 받아옵니다
      let imageUrl = null;
      if (imageFile) { // 실제 파일 객체를 저장해둬야 함
        const formData = new FormData();
        formData.append('image', imageFile);

        const imageResponse = await fetch(`/api/upload`, {
          method: 'POST',
          body: formData,
        });

        const imageData = await imageResponse.json();
        imageUrl = imageData.url; // 서버에서 반환한 이미지 URL
      }

      // 2. 리뷰 데이터를 이미지 URL과 함께 전송
      const review = {
        review_id: Date.now().toString(),
        item_id,
        seller_id,
        writer_id,
        content,
        rating,
        image_url: imageUrl, // 서버에 저장된 이미지 URL
        timestamp: new Date(),
      };

      // 3. 리뷰 데이터를 서버에 전송
      await fetch(`/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });

      alert('리뷰가 등록되었습니다!');
      navigate(-1);
    } catch (error) {
      console.error('리뷰 등록 실패:', error);
      alert('리뷰 등록에 실패했습니다.');
    }
  };

  return (
    <div className={styles.reviewPageWrapper}>
      <header className={styles.reviewHeader}>
        <button onClick={() => navigate(-1)} className={styles.headerButton}>←</button>
        <h2 style={{ margin: 0, fontSize: '18px' }}>리뷰 등록</h2>
        <div style={{ width: 24 }} /> {/* 빈 공간 맞춤용 */}
      </header>

      <div className={styles.reviewContent}>
        <label htmlFor="upload-img" className={styles.imageUpload}>
          {image ?
            <img src={image} alt="uploaded" className={styles.uploadedImage} /> :
            <div className={styles.placeholder}>사진 추가하기</div>
          }
        </label>
        <input id="upload-img" type="file" accept="image/*" onChange={handleImageChange} className={{ display: 'none' }} />

        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={i <= rating ? styles.activeStar : styles.star}
              onClick={() => setRating(i)}
            >★</span>
          ))}
        </div>

        <p className={styles.label}>평가를 남겨주세요!</p>
        <textarea
          placeholder="리뷰를 작성해 주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
        />
      </div>

      <button className={styles.submitBtn} onClick={handleSubmit}>등록</button>
    </div>
  );
};

export default ReviewPost;
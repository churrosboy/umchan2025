import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import header from "../styles/PageHeader.module.css";
import styles from "../styles/MyReview.module.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { ReactComponent as Star } from "../Icons/Star01.svg";

const RATING_LABELS = {1:"아쉬워요",2:"보통이에요",3:"괜찮아요",4:"만족해요",5:"최고예요"};

const My_review = () => {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [sellerNames, setSellerNames] = useState({});

  const goBack = () => navigate(-1);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) { alert("로그인이 필요합니다."); navigate("/"); return; }
      setAuthUser(fbUser);
      try {
        setLoading(true);
        const token = await fbUser.getIdToken();
        const res = await axios.get("/api/reviews/mine", { headers: { Authorization: `Bearer ${token}` }});
        const list = (res.data?.reviews || []).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
        setReviews(list);

        const ids = Array.from(new Set(list.map(r => r.seller_id))).filter(Boolean);
        const pairs = await Promise.all(ids.map(async id => {
          try {
            const r = await axios.get(`/api/users/nickname/${id}`, { headers: { Authorization: `Bearer ${token}` }});
            return [id, r.data?.nickname || id];
          } catch { return [id, id]; }
        }));
        setSellerNames(Object.fromEntries(pairs));
      } catch (e) {
        console.error(e); alert("리뷰 목록을 불러오지 못했습니다.");
      } finally { setLoading(false); }
    });
    return () => unsub();
  }, [navigate]);

  const fmtDate = d => (d ? new Date(d).toLocaleDateString() : "");

  const StarRow = ({ value=0 }) => {
    const v = Math.max(0, Math.min(5, parseInt(value,10)||0));
    return (
      <div className={styles.rating} aria-label={`별점 ${v} / 5`}>
        {Array.from({length:5}).map((_,i)=>(
          <Star key={i} className={`${styles.star} ${i < v ? styles.starOn : ""}`} />
        ))}
        <span className={styles.ratingText}>{v ? `${v}/5 ${RATING_LABELS[v]||""}` : "별점 없음"}</span>
      </div>
    );
  };

  const goSellerDetail = (sellerId) => navigate(`/seller_detail/${sellerId}`);

  // 수정
  const editReview = (reviewId) => {
    navigate(`/review/edit/${reviewId}`); // ReviewCreate를 '수정 모드'로 재사용
  };

  // 삭제
  const deleteReview = async (reviewId) => {
    const ok = window.confirm("리뷰를 삭제하시겠습니까?");
    if (!ok) return;

    try {
      const token = await authUser.getIdToken();
      await axios.delete(`/api/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${token}` }});
      setReviews(prev => prev.filter(r => r.review_id !== reviewId));
    } catch (e) {
      console.error(e);
      alert("리뷰 삭제에 실패했습니다.");
    }
  };

  return (
    <div className={`${header.wrapper} ${styles.page}`}>
      <div className={header.header}>
        <div className={header.backButton} onClick={goBack}>←</div>
        <div className={header.title}>나의 리뷰</div>
        <div className={header.saveButton} style={{ visibility: "hidden" }}>저장하기</div>
      </div>

      <div className={styles.scrollArea}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : reviews.length === 0 ? (
          <div className={styles.empty}>아직 작성한 리뷰가 없어요.</div>
        ) : (
          <div className={styles.list}>
            {reviews.map(rv => {
              const nickname = sellerNames[rv.seller_id] || rv.seller_id;
              const preview = (rv.images || []).slice(0, 3);
              return (
                <div key={rv.review_id} className={styles.card}>
                  {/* 헤더 영역: 판매자/날짜 */}
                  <div className={styles.cardHead}>
                    <div className={styles.sellerName} role="button" tabIndex={0}
                      onClick={() => goSellerDetail(rv.seller_id)}
                      onKeyDown={(e)=> e.key==="Enter" && goSellerDetail(rv.seller_id)}
                    >
                      {nickname} 님
                    </div>
                    <div className={styles.date}>{fmtDate(rv.timestamp)}</div>
                  </div>

                  {/* 별점 */}
                  <StarRow value={rv.rating} />

                  {/* 내용 */}
                  {rv.content && <div className={styles.content} title={rv.content}>{rv.content}</div>}

                  {/* 이미지 프리뷰 */}
                  {!!preview.length && (
                    <div className={styles.previewRow}>
                      {preview.map((src,i)=>(
                        <div className={styles.thumb} key={i}><img src={src} alt={`리뷰 이미지 ${i+1}`} /></div>
                      ))}
                      {rv.images.length > 3 && <div className={styles.moreBadge}>+{rv.images.length-3}</div>}
                    </div>
                  )}

                  {/* 하단 액션 버튼 */}
                  <div className={styles.actions}>
                    <button className={styles.btnOutline} onClick={() => editReview(rv.review_id)}>수정</button>
                    <button className={styles.btnDanger} onClick={() => deleteReview(rv.review_id)}>삭제</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default My_review;

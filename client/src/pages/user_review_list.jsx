// src/pages/ReviewList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import header from "../styles/PageHeader.module.css";      // ✅ MyReview와 동일
import styles from "../styles/MyReview.module.css";        // ✅ MyReview와 동일 CSS 재사용
import { ReactComponent as Star } from "../Icons/Star01.svg";

const RATING_LABELS = {1:"아쉬워요",2:"보통이에요",3:"괜찮아요",4:"만족해요",5:"최고예요"};

const ReviewList = () => {
  const { sellerId: sellerIdFromParams, userId: userIdFromParams } = useParams();
  const sellerId = sellerIdFromParams ?? userIdFromParams;
  const navigate = useNavigate();

  const [authToken, setAuthToken] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const goBack = () => navigate(-1);

  // 로그인 상태 → 토큰 확보
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setErr("로그인이 필요합니다.");
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();
      setAuthToken(token);
    });
    return () => unsub();
  }, []);

  // 판매자 정보 + 받은 리뷰 불러오기
  useEffect(() => {
    if (!authToken || !sellerId) return;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [userRes, rvRes] = await Promise.all([
          axios.get(`/api/users/${sellerId}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get(`/api/reviews/seller/${sellerId}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        setSeller(userRes.data || null);

        const arr = Array.isArray(rvRes.data?.reviews) ? rvRes.data.reviews : [];
        arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setReviews(arr);
      } catch (e) {
        console.error(e);
        setErr("리뷰를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [authToken, sellerId]);

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

  const StarRow = ({ value = 0 }) => {
    const v = Math.max(0, Math.min(5, parseInt(value, 10) || 0));
    return (
      <div className={styles.rating} aria-label={`별점 ${v} / 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${styles.star} ${i < v ? styles.starOn : ""}`}
          />
        ))}
        <span className={styles.ratingText}>
          {v ? `${v}/5 ${RATING_LABELS[v] || ""}` : "별점 없음"}
        </span>
      </div>
    );
  };

  const headerTitle = useMemo(() => {
    if (!seller) return "받은 리뷰";
    return seller.nickname || seller.name || "판매자";
  }, [seller]);

  return (
    <div className={`${header.wrapper} ${styles.page}`}>
      {/* ✅ MyReview와 동일 헤더 구조/클래스 */}
      <div className={header.header}>
        <div className={header.backButton} onClick={goBack} role="button" tabIndex={0}
             onKeyDown={(e)=> e.key === "Enter" && goBack()}>
          ←
        </div>
        <div className={header.title}>{headerTitle}</div>
        <div className={header.saveButton} style={{ visibility: "hidden" }}>빈버튼</div>
      </div>

      {/* ✅ MyReview와 동일 스크롤 영역 */}
      <div className={styles.scrollArea}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : err ? (
          <div className={styles.empty}>{err}</div>
        ) : !seller ? (
          <div className={styles.empty}>사용자를 찾을 수 없습니다.</div>
        ) : reviews.length === 0 ? (
          <div className={styles.empty}>아직 받은 리뷰가 없어요.</div>
        ) : (
          <div className={styles.list}>
            {reviews.map((rv) => {
              const buyerName =
                rv.buyer_nickname || rv.writer_nickname || rv.writer_id || "구매자";
              const preview = (rv.images || []).slice(0, 3);

              return (
                <div key={rv.review_id || rv.id} className={styles.card}>
                  {/* ✅ 카드 헤더: 닉네임/날짜 (클래스 그대로) */}
                  <div className={styles.cardHead}>
                    <div className={styles.sellerName}>{buyerName}</div>
                    <div className={styles.date}>{fmtDate(rv.timestamp)}</div>
                  </div>

                  {/* ✅ 별점 (동일 컴포넌트) */}
                  <StarRow value={rv.rating} />

                  {/* ✅ 내용 */}
                  {rv.content && (
                    <div className={styles.content} title={rv.content}>
                      {rv.content}
                    </div>
                  )}

                  {/* ✅ 이미지 프리뷰(최대 3) & +N 배지 */}
                  {!!preview.length && (
                    <div className={styles.previewRow}>
                      {preview.map((src, i) => (
                        <div className={styles.thumb} key={i}>
                          <img
                            src={src}
                            alt={`리뷰 이미지 ${i + 1}`}
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        </div>
                      ))}
                      {rv.images?.length > 3 && (
                        <div className={styles.moreBadge}>
                          +{rv.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ 액션 버튼 영역 제거 (수정/삭제 없음) */}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;

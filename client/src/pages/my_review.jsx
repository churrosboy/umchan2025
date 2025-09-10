// src/pages/my_review.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import header from "../styles/PageHeader.module.css";
import styles from "../styles/MyReview.module.css";
import { getAuth } from "firebase/auth";
import { ReactComponent as Star } from "../Icons/Star01.svg";

const StarRating = ({ value = 0, max = 5 }) => {
  const v = Math.max(0, Math.min(max, parseInt(value, 10) || 0));
  return (
    <div className={styles.rating} aria-label={`별점 ${v} / ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={styles.star}
          style={{
            fill: i < v ? "#FFC107" : "#E0E0E0",
            stroke: i < v ? "#FFC107" : "#E0E0E0",
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

const My_review = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [nickname, setNickname] = useState("");

  const goBack = () => navigate(-1);

  useEffect(() => {
    const run = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          setErr("로그인이 필요합니다.");
          return;
        }

        setNickname(
          user.displayName || (user.email ? user.email.split("@")[0] : "내 닉네임")
        );

        const idToken = await user.getIdToken();
        const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";
        const res = await fetch(`${API_BASE}/api/myreview`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!res.ok) {
          throw new Error(`서버 오류: ${res.status}`);
        }
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr(e.message || "불러오기 실패");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const list = useMemo(() => reviews, [reviews]);

  return (
    <div className={header.wrapper}>
      <div className={header.container}>
        {/* 상단 헤더 */}
        <div className={header.header}>
          <div className={header.backButton} onClick={goBack}>←</div>
          <div className={header.title}>나의 리뷰</div>
          <div className={header.saveButton}>저장하기</div>
        </div>

        {/* 바디 */}
        <div className={styles.body}>
          {loading && <div className={styles.stateText}>불러오는 중…</div>}
          {!loading && err && <div className={styles.error}>{err}</div>}

          {!loading && !err && (
            <ul className={styles.reviewList}>
              {list.length === 0 && (
                <li className={styles.empty}>아직 작성한 리뷰가 없어요.</li>
              )}

              {list.map((rv) => {
                const firstImg =
                  Array.isArray(rv.image_url) && rv.image_url.length > 0
                    ? rv.image_url[0]
                    : null;
                const d = rv.timestamp ? new Date(rv.timestamp) : null;

                return (
                  <li
                    key={rv._id || `${rv.seller_id}-${rv.item_id || ""}-${(rv.timestamp || "")}`}
                    className={styles.reviewItem}
                  >
                    {/* 왼쪽 사진 */}
                    <div className={styles.photoWrap}>
                      {firstImg ? (
                        <img
                          src={firstImg}
                          alt="리뷰 사진"
                          className={styles.photo}
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml;utf8," +
                              encodeURIComponent(
                                `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
                                  <rect width='100%' height='100%' fill='#eee'/>
                                  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#999' font-size='12'>no image</text>
                                </svg>`
                              );
                          }}
                        />
                      ) : (
                        <div className={styles.photoPlaceholder}>NO IMAGE</div>
                      )}
                    </div>

                    {/* 오른쪽 내용 */}
                    <div className={styles.contentArea}>
                      <div className={styles.rowTop}>
                        <div className={styles.nickname} title={nickname}>
                          {nickname}
                        </div>
                        <StarRating value={rv.rating} />
                      </div>

                      {d && (
                        <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>
                          {d.toLocaleDateString()} {d.toLocaleTimeString()}
                        </div>
                      )}

                      <p className={styles.text} title={rv.content || ""}>
                        {rv.content || "내용이 없습니다."}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default My_review;

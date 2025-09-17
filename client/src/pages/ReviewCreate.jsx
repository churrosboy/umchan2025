import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import header from "../styles/PageHeader.module.css";
import styles from "../styles/ReviewCreate.module.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { ReactComponent as Star } from "../Icons/Star01.svg";

/** 별점 라벨 매핑 */
const RATING_LABELS = { 1:"아쉬워요", 2:"보통이에요", 3:"괜찮아요", 4:"만족해요", 5:"최고예요" };

const MIN_LEN = 20;
const MAX_LEN = 1000;
const MAX_IMAGES = 6;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const ReviewCreate = () => {
  // 경로: 신규작성 /review/:orderId  |  수정 /review/edit/:reviewId
  const { orderId, reviewId } = useParams();
  const isEdit = Boolean(reviewId);

  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);

  // 주문 요약 (신규 작성 시)
  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [sellerNickname, setSellerNickname] = useState(null);

  // 입력 상태
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");

  // 이미지: 신규 추가 파일
  const [images, setImages] = useState([]);           // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // objectURL[]

  // 이미지: 수정 모드 전용 - 기존 URL 유지 리스트
  const [existingUrls, setExistingUrls] = useState([]); // 로드된 기존 이미지 전체
  const [keepUrls, setKeepUrls] = useState([]);         // 유지할 기존 이미지 (삭제 시 제거)

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fileInputRef = useRef(null);

  /* --------------------- Auth & 데이터 로딩 --------------------- */
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        alert("로그인이 필요합니다.");
        navigate("/");
        return;
      }
      setAuthUser(fbUser);

      try {
        setFetching(true);
        const token = await fbUser.getIdToken();

        if (!isEdit) {
          // 신규 작성: 주문 요약 가져오기 (단건 or 목록 fallback)
          let orderDoc = null;
          try {
            const ordRes = await axios.get(`/api/orders/${orderId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            orderDoc = ordRes.data;
          } catch {
            try {
              const listRes = await axios.get(`/api/orders/buyer`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const found = (listRes.data || []).find((o) => o.order_id === orderId);
              orderDoc = found || null;
            } catch {
              orderDoc = null;
            }
          }
          if (orderDoc) {
            setOrder(orderDoc);
            try {
              const prodRes = await axios.get(`/api/products/${orderDoc.item_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setProduct(prodRes.data || null);
            } catch { setProduct(null); }
            try {
              const userRes = await axios.get(`/api/users/nickname/${orderDoc.seller_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setSellerNickname(userRes.data?.nickname || null);
            } catch { setSellerNickname(null); }
          }
        } else {
          // 수정 모드: 기존 리뷰 로딩
          const res = await axios.get(`/api/reviews/${reviewId}`);
          const rv = res.data?.review;
          if (!rv) throw new Error("리뷰를 찾을 수 없습니다.");
          setRating(rv.rating || 0);
          setContent(rv.content || "");
          const urls = Array.isArray(rv.images) ? rv.images : [];
          setExistingUrls(urls);
          setKeepUrls(urls); // 초기값 - 모두 유지
        }
      } catch (e) {
        console.error(e);
        alert(isEdit ? "리뷰 정보를 불러오지 못했습니다." : "주문 정보를 불러오지 못했습니다.");
        navigate(-1);
      } finally {
        setFetching(false);
      }
    });
    return () => unsub();
  }, [isEdit, orderId, reviewId, navigate]);

  /* --------------------- 이미지 프리뷰 관리 (신규 추가 파일만) --------------------- */
  useEffect(() => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    const next = images.map((file) => URL.createObjectURL(file));
    setImagePreviews(next);
    return () => {
      next.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  /* --------------------- 유효성 --------------------- */
  const counter = `${content.length}/${MAX_LEN}`;
  const tooShort = content.trim().length > 0 && content.trim().length < MIN_LEN;

  const canSubmit = useMemo(() => {
    if (isSubmitting) return false;
    if (!authUser) return false;
    if (!(rating >= 1 && rating <= 5)) return false;
    if (content.trim().length < MIN_LEN) return false;
    // 수정 모드에서는 keepUrls + images 합산 개수로 제한
    const totalImgs = (keepUrls?.length || 0) + (images?.length || 0);
    if (totalImgs > MAX_IMAGES) return false;
    if (images.some((f) => f.size > MAX_SIZE)) return false;
    return true;
  }, [authUser, rating, content, images, isSubmitting, keepUrls]);

  /* --------------------- 핸들러 --------------------- */
  const onPickImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // 형식/용량 가드
    const safe = [];
    for (const f of files) {
      if (!/^image\/(png|jpe?g|webp|gif)$/i.test(f.type)) {
        alert("이미지 파일만 업로드 가능합니다.");
        continue;
      }
      if (f.size > MAX_SIZE) {
        alert("이미지 용량은 파일당 5MB를 넘을 수 없습니다.");
        continue;
      }
      safe.push(f);
    }

    // 수정 모드: 최대 장수 고려
    const cap = MAX_IMAGES - ((keepUrls?.length || 0) + (images?.length || 0));
    const merged = [...images, ...safe.slice(0, Math.max(0, cap))];
    setImages(merged);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingUrl = (url) => {
    setKeepUrls(prev => prev.filter(u => u !== url));
  };

  const onRatingKeyDown = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setRating((r) => Math.min(5, (r || 0) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setRating((r) => Math.max(1, (r || 0) - 1));
    }
  };

  /* --------------------- 제출 --------------------- */
  const submitReview = async () => {
    if (!authUser) return;
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      const token = await authUser.getIdToken();

      if (!isEdit) {
        // 신규 작성
        const seller_id = order?.seller_id || "";
        const item_id = order?.item_id || "";

        const fd = new FormData();
        fd.append("seller_id", seller_id);
        fd.append("order_id", orderId);
        fd.append("item_id", item_id);
        fd.append("rating", String(rating));
        fd.append("content", content.trim());
        images.forEach((f) => fd.append("images", f));

        await axios.post(`/api/reviews`, fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        alert("리뷰가 등록되었습니다.");
        navigate(-1);
      } else {
        // 수정: 1) 내용/별점
        await axios.patch(`/api/reviews/${reviewId}`, {
          rating, content: content.trim()
        }, { headers: { Authorization: `Bearer ${token}` }});

        // 2) 이미지 변경 있으면 교체
        const imagesChanged =
          images.length > 0 ||
          keepUrls.length !== existingUrls.length ||
          existingUrls.some(u => !keepUrls.includes(u));

        if (imagesChanged) {
          const fd2 = new FormData();
          keepUrls.forEach(u => fd2.append("keep", u));
          images.forEach(f => fd2.append("images", f));
          await axios.put(`/api/reviews/${reviewId}/images`, fd2, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }

        alert("리뷰가 수정되었습니다.");
        navigate(-1);
      }
    } catch (err) {
      console.error(err);
      alert(isEdit ? "리뷰 수정에 실패했습니다." : "리뷰 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* --------------------- UI --------------------- */
  return (
    <div className={`${header.wrapper} ${styles.wrapper}`}>
      {/* 상단 헤더 */}
      <div className={header.header}>
        <div className={header.backButton} onClick={() => navigate(-1)} aria-label="뒤로가기" role="button" tabIndex={0}>
          ←
        </div>
        <div className={styles.centerTitle}>{isEdit ? "리뷰 수정" : "리뷰 쓰기"}</div>
      </div>

      {/* 본문 */}
      <div className={styles.contentContainer}>
        {/* 주문 요약 (신규 작성 시만) */}
        {!isEdit && (
          <section className={styles.summaryCard} aria-busy={fetching}>
            {!order ? (
              <div className={styles.summaryFallback}>
                {fetching ? "주문 정보를 불러오는 중..." : "주문 요약을 가져오지 못했습니다."}
              </div>
            ) : (
              <div className={styles.summaryInner}>
                <div className={styles.summaryThumb}>
                  {product?.pic ? (
                    <img src={product.pic} alt="상품 이미지" />
                  ) : (
                    <div className={styles.thumbPlaceholder}>IMG</div>
                  )}
                </div>
                <div className={styles.summaryMeta}>
                  <div className={styles.metaTitle} title={product?.name || order.item_name || ""}>
                    {product?.name || order.item_name || "상품명"}
                  </div>
                  <div className={styles.metaSeller}>
                    {sellerNickname ? `${sellerNickname} 님` : order.seller_id}
                  </div>
                  <div className={styles.metaDate}>
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 별점 */}
        <section className={styles.ratingBox}>
          <div className={styles.ratingRow}>
            <div
              className={styles.starGroup}
              role="slider"
              aria-valuemin={1}
              aria-valuemax={5}
              aria-valuenow={rating || 0}
              tabIndex={0}
              onKeyDown={onRatingKeyDown}
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const v = i + 1;
                const active = (hoverRating || rating) >= v;
                return (
                  <button
                    type="button"
                    key={v}
                    className={`${styles.starBtn} ${active ? styles.starActive : ""}`}
                    aria-label={`${v}점`}
                    onMouseEnter={() => setHoverRating(v)}
                    onMouseLeave={() => setHoverRating(0)}
                    onFocus={() => setHoverRating(v)}
                    onBlur={() => setHoverRating(0)}
                    onClick={() => setRating(v)}
                  >
                    <Star className={styles.starIcon} />
                  </button>
                );
              })}
            </div>
            <div className={styles.ratingLabel}>
              {(rating && RATING_LABELS[rating]) || "별점을 선택해 주세요"}
            </div>
          </div>
        </section>

        {/* 가이드 칩 */}
        <section className={styles.guideChips} aria-hidden="false">
          <span className={styles.chip}>#맛</span>
          <span className={styles.chip}>#양</span>
          <span className={styles.chip}>#신선도</span>
          <span className={styles.chip}>#포장</span>
          <span className={styles.chip}>#친절</span>
          <span className={styles.chip}>#재구매의사</span>
        </section>

        {/* 텍스트 입력 */}
        <section className={styles.textSection}>
          <textarea
            className={styles.textArea}
            placeholder="음식 맛/양/신선도, 판매자 친절도 등 솔직한 후기를 남겨주세요. (최소 20자)"
            maxLength={MAX_LEN}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className={styles.textMeta}>
            <span className={`${styles.helper} ${tooShort ? styles.helperWarn : ""}`}>
              {tooShort ? `리뷰는 최소 ${MIN_LEN}자 이상 작성해 주세요.` : "성의 있는 리뷰는 다른 사용자에게 큰 도움이 돼요."}
            </span>
            <span className={styles.counter}>{counter}</span>
          </div>
        </section>

        {/* 이미지 업로드 */}
        <section className={styles.imageSection}>
          <div className={styles.imageHeader}>
            <div className={styles.imageTitle}>사진 업로드</div>
            <div className={styles.imageHint}>최대 {MAX_IMAGES}장, 1장당 5MB</div>
          </div>

          <div className={styles.imageGrid}>
            {/* 수정모드: 기존 이미지(유지 목록) */}
            {isEdit && keepUrls.map((url) => (
              <div className={styles.imageTile} key={url}>
                <img src={url} alt="기존 이미지" />
                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label="이미지 제거"
                  onClick={() => removeExistingUrl(url)}
                >
                  ×
                </button>
              </div>
            ))}

            {/* add tile */}
            {(keepUrls.length + imagePreviews.length) < MAX_IMAGES && (
              <label className={styles.addTile}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPickImages}
                  style={{ display: "none" }}
                />
                <div className={styles.addPlus}>＋</div>
                <div className={styles.addText}>추가</div>
              </label>
            )}

            {/* 신규로 선택한 파일 프리뷰 */}
            {imagePreviews.map((src, idx) => (
              <div className={styles.imageTile} key={`new-${idx}`}>
                <img src={src} alt={`리뷰 이미지 ${idx + 1}`} />
                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label="이미지 제거"
                  onClick={() => removeImage(idx)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 제출바 */}
        <div className={styles.submitBar}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            type="button"
            className={`${styles.submitBtn} ${!canSubmit ? styles.disabled : ""}`}
            disabled={!canSubmit}
            onClick={submitReview}
          >
            {isEdit ? (isSubmitting ? "수정 중..." : "리뷰 수정하기") : (isSubmitting ? "전송 중..." : "리뷰 작성하기")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCreate;

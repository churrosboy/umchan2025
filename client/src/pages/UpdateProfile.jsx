import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUser, HiPlus } from 'react-icons/hi2';
import InlineEditor from '../components/InlineProfileEditor';
import { ReactComponent as Star } from '../Icons/Star01.svg';
import { ReactComponent as Heart } from '../Icons/Heart01.svg';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import styles from '../styles/UpdateProfile.module.css';

const UpdateProfile = () => {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(null);
  const [serverUser, setServerUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 미리보기 URL을 정리하기 위한 레퍼런스(메모리 누수 방지)
  const revokeUrlsRef = useRef([]);

  const API_BASE = process.env.REACT_APP_API_BASE || '';
  const toPublicUrl = (src) => {
   if (!src) return null;
   if (/^(https?:)?\/\//.test(src) || src.startsWith('blob:') || src.startsWith('data:')) {
     return src; // 절대/블랍/데이터 URL은 그대로
   }
   // 서버가 주는 경로가 '/api/uploads/...' 같은 상대경로일 때
   return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
  };

  const [profile, setProfile] = useState({
    nickname: '',
    disc: '',

    // 프로필 이미지
    filePreview: null, // string | null (URL 또는 서버의 저장 경로)
    fileFile: null,    // File | null
    clearProfile: false,

    // 썸네일 3칸
    main_imgPreviews: Array(3).fill(null), // string | null
    main_imgFiles: Array(3).fill(null),    // File | null
    clearThumbs: [false, false, false]
  });

  // 안전 숫자
  const safeNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  // GeoJSON/location 포맷팅 (객체 → 문자열)
  const formatLocation = (loc) => {
    if (!loc) return '';
    if (typeof loc === 'string') return loc;
    if (loc && loc.type === 'Point' && Array.isArray(loc.coordinates)) {
      const [lng, lat] = loc.coordinates;
      const sLat = Number.isFinite(Number(lat)) ? Number(lat).toFixed(5) : '';
      const sLng = Number.isFinite(Number(lng)) ? Number(lng).toFixed(5) : '';
      if (sLat && sLng) return `${sLat}, ${sLng}`;
    }
    try { return JSON.stringify(loc); } catch { return ''; }
  };

  // 미리보기 URL 정리
  const pushRevokeUrl = (url) => {
    if (url?.startsWith('blob:')) revokeUrlsRef.current.push(url);
  };
  useEffect(() => {
    return () => {
      revokeUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

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

        const res = await axios.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = res?.data?.user;
        if (!userData) {
          alert('사용자를 찾을 수 없습니다.');
          navigate('/');
          return;
        }
        setServerUser(userData);

        const thumbs = Array.isArray(userData.thumbnail_list) ? userData.thumbnail_list : [];
        setProfile({
          nickname: userData.nickname ?? '',
          disc: userData.intro ?? '',

          filePreview: toPublicUrl(userData.profile_image ?? null),
          fileFile: null,
          clearProfile: false,

          main_imgPreviews: [...thumbs, null, null].slice(0, 3).map(toPublicUrl),
          main_imgFiles: [null, null, null],
          clearThumbs: [false, false, false]
        });
      } catch (err) {
        console.error(err);
        alert('프로필을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  const updateNickname = (newNickname) => {
    setProfile((prev) => ({ ...prev, nickname: newNickname }));
  };

  const updateDisc = (newDisc) => {
    setProfile((prev) => ({ ...prev, disc: newDisc }));
  };

  const updateFile = (newFile) => {
    if (!newFile) return;
    const url = URL.createObjectURL(newFile);
    pushRevokeUrl(url);
    setProfile((prev) => ({
      ...prev,
      filePreview: url,
      fileFile: newFile,
      clearProfile: false
    }));
  };

  const handleRemoveProfileImage = () => {
    // 서버에 삭제 플래그 전달하기 위해 clearProfile = true
    setProfile((prev) => ({
      ...prev,
      filePreview: null,
      fileFile: null,
      clearProfile: true
    }));
  };

  const handleAddImage = (slotIdx, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    pushRevokeUrl(url);
    setProfile((prev) => {
      const ps = [...prev.main_imgPreviews];
      const fs = [...prev.main_imgFiles];
      const cs = [...prev.clearThumbs];
      ps[slotIdx] = url;
      fs[slotIdx] = file;
      cs[slotIdx] = false; // 새 파일로 교체되므로 삭제 아님
      return { ...prev, main_imgPreviews: ps, main_imgFiles: fs, clearThumbs: cs };
    });
  };

  const handleRemoveImage = (slotIdx) => {
    setProfile((prev) => {
      const ps = [...prev.main_imgPreviews];
      const fs = [...prev.main_imgFiles];
      const cs = [...prev.clearThumbs];
      ps[slotIdx] = null;
      fs[slotIdx] = null;
      cs[slotIdx] = true; // 삭제 플래그
      return { ...prev, main_imgPreviews: ps, main_imgFiles: fs, clearThumbs: cs };
    });
  };

  const goBack = () => navigate(-1);

  // FormData로 저장
  const SaveProfile = async () => {
    if (!authUser) return;
    try {
      const token = await authUser.getIdToken();
      const form = new FormData();
      form.append('nickname', profile.nickname ?? '');
      form.append('intro', profile.disc ?? '');

      // 프로필 이미지
      if (profile.fileFile) {
        form.append('profile_image', profile.fileFile);
      }
      form.append('clear_profile_image', String(!!profile.clearProfile));

      // 썸네일 0~2
      for (let i = 0; i < 3; i++) {
        if (profile.main_imgFiles[i]) {
          form.append(`thumbnail${i}`, profile.main_imgFiles[i]);
        }
        form.append(`clear_thumbnail${i}`, String(!!profile.clearThumbs[i]));
      }

      const res = await axios.patch('/api/profile', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type은 FormData 사용 시 axios가 자동 설정
        },
      });

      const updated = res?.data?.user;
      if (updated) {
        setServerUser(updated);
        const thumbs = Array.isArray(updated.thumbnail_list) ? updated.thumbnail_list : [];
        setProfile((prev) => ({
          ...prev,
          filePreview: toPublicUrl(updated.profile_image ?? null),
          fileFile: null,
          clearProfile: false,
          main_imgPreviews: [...thumbs, null, null].slice(0, 3).map(toPublicUrl),
          main_imgFiles: [null, null, null],
          clearThumbs: [false, false, false],
        }));
      }
      alert('저장되었습니다.');
    } catch (e) {
      console.error(e);
      alert('저장에 실패했습니다.');
    }
  };

  if (loading) return <div style={{ padding: 16 }}>로딩 중...</div>;

  const rating = safeNumber(serverUser?.avg_rating, 0);
  const reviewCnt = safeNumber(serverUser?.review_cnt, 0);
  const likeCnt = safeNumber(serverUser?.like_cnt, 0);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.backButton}>
            <span onClick={goBack}>←</span>
          </div>
          <div className={styles.headerTitle}>프로필</div>
          <div className={styles.saveButton}>
            <span onClick={SaveProfile}>저장하기</span>
          </div>
        </div>

        <div className={styles.scrollArea}>
          <div className={styles.profileContainer}>
            <label className={styles.profileImageContainer}>
              <input
                type="file"
                accept="image/*"
                className={styles.photoInput}
                onChange={(e) => updateFile(e.target.files?.[0])}
              />
              {profile.filePreview ? (
                <>
                  <img
                    src={profile.filePreview}
                    alt="프로필 사진"
                    className={styles.profileImage}
                  />
                  <div
                    className={styles.removeIcon}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveProfileImage();
                    }}
                  >
                    ×
                  </div>
                </>
              ) : (
                <HiUser size={36} />
              )}
            </label>

            <div className={styles.profileNameRow}>
              <InlineEditor
                initialValue={profile.nickname}
                onSave={(newNick) => updateNickname(newNick)}
              />
              <p className={styles.text}>
                <Star width={15} height={15} className={styles.inlineIcon} />
                {rating.toFixed(1)} ({reviewCnt})
                <Heart
                  width={17}
                  height={17}
                  className={`${styles.inlineIcon} ${styles.heartIcon}`}
                />
                {likeCnt}
              </p>
            </div>

            <InlineEditor
              initialValue={profile.disc}
              onSave={(newDisc) => updateDisc(newDisc)}
            />

            <div style={{ margin: 6 }}></div>
          </div>
        </div>

        <div className={styles.panelContent}>
          <div className={styles.userItem}>
            <strong className={styles.userItemStrong}>{profile.nickname}</strong>

            <p className={styles.userItemParagraph}>
              <Star width={15} height={15} className={styles.inlineIcon} />
              {rating.toFixed(1)} ({reviewCnt})
              <Heart
                width={17}
                height={17}
                className={`${styles.inlineIcon} ${styles.heartIcon}`}
              />
              {likeCnt}
            </p>

            <p className={styles.userItemParagraph}>
              {formatLocation(serverUser?.location) || serverUser?.address || ''}
            </p>

            <div className={styles.thumbnailScroll}>
              {[0, 1, 2].map((slotIdx) => {
                const filled = profile.main_imgPreviews
                  .map((img, i) => (img ? i : -1))
                  .filter((i) => i >= 0);
                const lastFilled = filled.length ? filled[filled.length - 1] : -1;

                return (
                  <label key={slotIdx} className={styles.thumbnailSlot}>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.photoInput}
                      onChange={(e) => handleAddImage(slotIdx, e.target.files?.[0])}
                    />
                    {profile.main_imgPreviews[slotIdx] ? (
                      <>
                        <img
                          src={profile.main_imgPreviews[slotIdx]}
                          alt={`썸네일${slotIdx}`}
                          className={styles.thumbnailImage}
                        />
                        {slotIdx === lastFilled && (
                          <div
                            className={styles.removeIcon}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveImage(slotIdx);
                            }}
                          >
                            ×
                          </div>
                        )}
                      </>
                    ) : (
                      <HiPlus size={24} />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.margin}></div>
      </div>
    </div>
  );
};


export default UpdateProfile;

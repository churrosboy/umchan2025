import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUser, HiPlus } from 'react-icons/hi2';
import InlineEditor from '../components/InlineProfileEditor';
import { ReactComponent as Star } from '../Icons/Star01.svg';
import { ReactComponent as Heart } from '../Icons/Heart01.svg';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

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
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.backButton}>
            <span onClick={goBack}>←</span>
          </div>
          <div style={styles.headerTitle}>프로필</div>
          <div style={styles.saveButton}>
            <span onClick={SaveProfile}>저장하기</span>
          </div>
        </div>

        <div style={styles.scrollArea}>
          <div style={styles.profileContainer}>
            <label style={{ ...styles.profileImageContainer, position: 'relative' }}>
              <input
                type="file"
                accept="image/*"
                style={styles.photoInput}
                onChange={(e) => updateFile(e.target.files?.[0])}
              />
              {profile.filePreview ? (
                <>
                  <img src={profile.filePreview} alt="프로필 사진" style={styles.profileImage} />
                  <div
                    style={styles.removeIcon}
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

            <div style={styles.profileNameRow}>
              <InlineEditor
                initialValue={profile.nickname}
                onSave={(newNick) => updateNickname(newNick)}
              />
              <p style={styles.text}>
                <Star width={15} height={15} style={{ verticalAlign: 'middle' }} />
                {rating.toFixed(1)} ({reviewCnt})
                <Heart width={17} height={17} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
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

        <div style={styles.panelContent}>
          <div style={styles.userItem}>
            <strong style={styles.userItemStrong}>{profile.nickname}</strong>
            <p style={styles.userItemParagraph}>
              <Star width={15} height={15} style={{ verticalAlign: 'middle' }} />
              {rating.toFixed(1)} ({reviewCnt})
              <Heart width={17} height={17} style={{ verticalAlign: 'middle', marginLeft: 6 }} />
              {likeCnt}
            </p>

            {/* GeoJSON location → 문자열 변환 */}
            <p style={styles.userItemParagraph}>
              {formatLocation(serverUser?.location) || serverUser?.address || ''}
            </p>

            <div style={styles.thumbnailScroll}>
              {[0, 1, 2].map((slotIdx) => {
                // 마지막 채워진 인덱스 계산
                const filled = profile.main_imgPreviews
                  .map((img, i) => (img ? i : -1))
                  .filter((i) => i >= 0);
                const lastFilled = filled.length ? filled[filled.length - 1] : -1;

                return (
                  <label key={slotIdx} style={{ ...styles.thumbnailSlot, position: 'relative' }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={styles.photoInput}
                      onChange={(e) => handleAddImage(slotIdx, e.target.files?.[0])}
                    />
                    {profile.main_imgPreviews[slotIdx] ? (
                      <>
                        <img
                          src={profile.main_imgPreviews[slotIdx]}
                          alt={`썸네일${slotIdx}`}
                          style={styles.thumbnailImage}
                        />
                        {slotIdx === lastFilled && (
                          <div
                            style={styles.removeIcon}
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

        <div style={styles.margin}></div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#fff',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    padding: '0 16px'
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    fontWeight: 'bold',
    fontSize: 16,
    borderBottom: '1px solid #ddd',
    position: 'relative'
  },
  backButton: {
    cursor: 'pointer',
    fontSize: 18,
    color: '#333'
  },
  saveButton: {
    cursor: 'pointer',
    fontSize: 14,
    color: '#333'
  },
  headerTitle: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    fontWeight: 'bold'
  },
  scrollArea: {
    flex: 0,
    overflowY: 'auto'
  },
  profileContainer: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: '100%',
    backgroundColor: '#B4B3B3',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  profileNameRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    margin: 0,
    fontSize: 13,
    color: '#666'
  },
  panelContent: {
    flex: 0,
    overflowY: 'auto'
  },
  userItemStrong: {
    fontSize: 'clamp(14px, 4vw, 18px)'
  },
  userItemParagraph: {
    fontSize: 'clamp(12px, 3.5vw, 16px)',
    margin: '4px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  thumbnailScroll: {
    display: 'flex',
    overflowX: 'auto',
    gap: '8px',
    marginTop: '16px',
    marginBottom: '16px'
  },
  thumbnailImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
    flexShrink: 0
  },
  userItem: {
    borderBottom: '1px solid #ddd',
    cursor: 'pointer'
  },
  thumbnailSlot: {
    width: '80px',
    height: '80px',
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden'
  },
  removeIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    background: '#fff',
    borderRadius: '50%',
    width: 20,
    height: 20,
    lineHeight: '20px',
    textAlign: 'center',
    fontSize: '14px',
    cursor: 'pointer',
    zIndex: 2
  },
  margin: {
    padding: '30px'
  },
  photoInput: {
    display: 'none' // 숨김 처리
  }
};

export default UpdateProfile;

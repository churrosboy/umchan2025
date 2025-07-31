import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { users } from '../data/users';
import { HiUser, HiPencil, HiCheck, HiPlus, HiMiniXCircle} from 'react-icons/hi2';
import InlineEditor from '../components/InlineProfileEditor';

const UpdateProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const user = users.find(u => u.id === Number(userId));
    

    const [profile, setProfile] = useState({
        nickname: user.nickname,
        disc: user.disc,
        file: user.profile_img,
        main_img: [...user.main_img, null].slice(0, 3)
    });

    const updateNickname = newNickname => {
        setProfile(prev => ({
            ...prev,
            nickname: newNickname
        }));
    };

    const updateDisc = newDisc => {
        setProfile(prev => ({
            ...prev,
            disc: newDisc
        }));
    };

    const updateFile = newFile => {
        setProfile(prev => ({
            ...prev,
            file: URL.createObjectURL(newFile)
        }));
    };

    const handleRemoveProfileImage = () => {
      setProfile(prev => ({ ...prev, file: null }));
    };

    // main_img 슬롯에 이미지 추가/교체
    const handleAddImage = (slotIdx, file) => {
        setProfile(prev => {
            const imgs = [...prev.main_img];
            imgs[slotIdx] = URL.createObjectURL(file);
            return { ...prev, main_img: imgs };
        });
    };

    // main_img 슬롯에서 이미지 제거
    const handleRemoveImage = slotIdx => {
        setProfile(prev => {
            const imgs = [...prev.main_img];
            imgs[slotIdx] = null;
            return { ...prev, main_img: imgs };
        });
    };

    if (!user) return <div>사용자를 찾을 수 없습니다.</div>;

    const goBack = () => {
        navigate(-1);
    };

    const SaveProfile = () => {

    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.backButton}><span onClick={goBack}>←</span></div>
                    <div style={styles.headerTitle}>프로필</div>
                    <div style={styles.saveButton}><span onclick={SaveProfile}>저장하기</span></div>
                </div>
                <div style={styles.scrollArea}>
                    <div style={styles.profileContainer}>
                        <label style={{ ...styles.profileImageContainer, position: 'relative' }}>
                          <input
                            type="file"
                            style={styles.photoInput}
                            onChange={e => updateFile(e.target.files[0])}
                          />
                          {profile.file ? (
                            <>
                              <img
                                src={profile.file}
                                alt="프로필 사진"
                                style={styles.profileImage}
                              />
                              <div style={styles.removeIcon}
                                    onClick={e => {
                                      e.preventDefault();    // 레이블 기본 동작 방지
                                      e.stopPropagation();   // 이벤트 버블링 방지
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
                          initialValue={user.nickname}
                          onSave={newNick => {
                            setProfile(prev => ({ ...prev, nickname: newNick }));
                            // 서버 저장 등 추가 로직
                          }}
                        />
                        <p>⭐ {user.avg_rating} ({user.review_cnt}) 💚 {user.like_cnt}</p>
                        </div>
                        <InlineEditor
                          initialValue={user.disc}
                          onSave={newDisc => {
                            setProfile(prev => ({ ...prev, disc: newDisc }));
                            // 서버 저장 등 추가 로직
                          }}
                        />
                        <div style={{margin:6}}></div>
                    </div>
                </div>
                <div style={styles.panelContent}>
                    <div style={styles.userItem}>
                        <strong style={styles.userItemStrong}>{profile.nickname}</strong>
                        <p style={styles.userItemParagraph}>⭐ {user.avg_rating} ({user.review_cnt}) 💚 {user.like_cnt}</p>
                        <p style={styles.userItemParagraph}>{user.location}</p>
                        <div style={styles.thumbnailScroll}>
                          {[0,1,2].map(slotIdx => {
                            // 마지막 채워진 인덱스 계산
                            const filled = profile.main_img
                              .map((img,i) => img ? i : -1)
                              .filter(i => i>=0);
                            const lastFilled = filled.length ? filled[filled.length-1] : -1;
                        
                            return (
                              <label key={slotIdx}
                                     style={{ ...styles.thumbnailSlot, position: 'relative' }}>
                                <input
                                  type="file"
                                  style={styles.photoInput}
                                  onChange={e => handleAddImage(slotIdx, e.target.files[0])}
                                />
                                {profile.main_img[slotIdx] ? (
                                  <>
                                    <img
                                      src={profile.main_img[slotIdx]}
                                      alt={`썸네일${slotIdx}`}
                                      style={styles.thumbnailImage}
                                    />
                                    {slotIdx === lastFilled && (
                                      <div style={styles.removeIcon}
                                            onClick={e => {
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
    },
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        fontWeight: 'bold',
        fontSize: 16,
        borderBottom: '1px solid #ddd',
        position: 'relative',
    },
    backButton: {
        cursor: 'pointer',
        fontSize: 18,
        color: '#333',
    },
    saveButton: {
        cursor: 'pointer',
        fontSize: 14,
        color: '#333',
    },
    headerTitle: {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontWeight: 'bold',
    },
    scrollArea: {
        flex: 0,
        overflowY: 'auto',
    },
    profileContainer: {
        padding: 20,
        display: 'flex', 
        flexDirection: 'column', 
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
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
        gap: 6,
        marginBottom: 6,
    },
    profileName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    profileRating: {
        fontSize: 13,
        color: '#666',
    },
    profileDesc: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
    },
    photoInput: { display: 'none' },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginBottom: 20,
        width: '100%'
    },
    buttonYellow: {
        backgroundColor: '#fcd265',
        border: 'none',
        borderRadius: 8,
        padding: 12,
        fontWeight: 'bold',
        fontSize: 14,
        cursor: 'pointer',
        marginBottom: 0,
        margin: '0 16px'
    },
    infoRow: {
        fontSize: 12,
        color: '#999',
        marginBottom: 20,
    },
    menuList: {
        padding: '0 20px',
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid #eee',
        fontSize: 14,
    },
    menuIcon: {
        fontSize: 18,
        marginRight: 10,
        color: '#fcd265',
    },
    clickableText: {
        cursor: 'pointer',
    },
    panelContent: {
        flex: 0,
        overflowY: 'auto',
        padding: '10px',
    },
    userItemStrong: {
        fontSize: 'clamp(14px, 4vw, 18px)'
    },
    userItemParagraph: {
        fontSize: 'clamp(12px, 3.5vw, 16px)',
        margin: '4px 0'
    },
    thumbnailScroll: {
        display: 'flex',        // 가로 정렬
        overflowX: 'auto',      // 가로 스크롤
        gap: '8px',             // 아이템 간격
        marginTop: '12px',      // 텍스트와 쫌 띄우기
    },
    thumbnailImage: {
        width: '80px',          // 적당히 줄인 크기
        height: '80px',
        objectFit: 'cover',
        borderRadius: '8px',
        flexSrink: 0
    },
    userItem: {
      padding: '10px',
      borderBottom: '1px solid #ddd',
      cursor: 'pointer',
    },
    thumbnailSlot: {
        width: '80px',
        height: '80px',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '8px',
        backgroundColor: '#f0f0f0', /* 비어 있을 때 연한 회색 배경 */
        overflow: 'hidden'
    },  
    // 빈 슬롯에 적용할 라벨(파일 인풋 + 플러스 아이콘)
    thumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        position: 'relative'
    },

    removeIcon: {
        position: 'absolute',
        top: 4, right: 4,
        background: '#fff',
        borderRadius: '50%',
        width: 20, height: 20,
        lineHeight: '20px',
        textAlign: 'center',
        fontSize: '14px',
        cursor: 'pointer',
        zIndex: 2
    },
};

export default UpdateProfile;

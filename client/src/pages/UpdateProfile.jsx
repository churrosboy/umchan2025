import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { users } from '../data/users';
import { HiUser, HiPencil, HiCheck } from 'react-icons/hi2';
import InlineEditor from '../components/InlineProfileEditor';

const UpdateProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const user = users.find(u => u.id === Number(userId));
    

    const [profile, setProfile] = useState({
        nickname: user.nickname,
        disc: user.disc,
        file: user.profile_img
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

    if (!user) return <div>사용자를 찾을 수 없습니다.</div>;

    const goToSellerAuth = () => {
        navigate('/seller_auth/' + userId);
    };

    const goToSellerItem = () => {
        navigate('/seller_detail/' + userId);
    }

    const goToRecipeList = () => {
        navigate('/user_recipe_list/' + userId);
    }

    const goToReviewList = () => {
        navigate('/user_review_list/' + userId);
    }

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
                <label style={styles.profileImageContainer}>
                    <input
                        type="file"
                        style={styles.photoInput}
                        onChange={e => updateFile(e.target.files[0])}
                    />
                    {profile.file ? (
                      <img
                        src={profile.file}
                        alt='프로필 사진'
                        style={styles.profileImage}
                      />
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
        flex: 1,
        overflowY: 'auto',
        paddingBottom: 80,
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
    }
};

export default UpdateProfile;

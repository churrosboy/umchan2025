import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;

const OtherProfile = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/users/${userId}`);

                if (!response.ok) {
                    throw new Error('사용자 정보를 불러오는데 실패했습니다.');
                }
                
                const userData = await response.json();
                setUser(userData);
                setError(null);
            } catch (err) {
                console.error('❌ 사용자 정보 조회 실패:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, [userId]);

    if (loading) return <div style={styles.loading}>로딩 중...</div>;
    if (error || !user) return <div style={styles.error}>사용자를 찾을 수 없습니다.</div>;

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
    
    // 관심 판매자 등록
    const addToFavorites = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}/heart`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('관심 판매자 등록에 실패했습니다.');
            }
            
            const updatedUser = await response.json();
            setUser(updatedUser);
            alert('관심 판매자로 등록되었습니다!');
        } catch (err) {
            console.error('❌ 관심 판매자 등록 실패:', err);
            alert('관심 판매자 등록에 실패했습니다.');
        }
    };
    
    // 시간 차이 계산
    const getTimeDiff = (date) => {
        const now = new Date();
        const lastLogin = new Date(date);
        const diffMs = now - lastLogin;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHrs < 1) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return `${diffMins}분 전`;
        } else if (diffHrs < 24) {
            return `${diffHrs}시간 전`;
        } else {
            const diffDays = Math.floor(diffHrs / 24);
            return `${diffDays}일 전`;
        }
    };

    return (
        <div style={styles.wrapper}>
        <div style={styles.container}>
            <div style={styles.header}>
            <div style={styles.backButton}><span onClick={goBack}>←</span></div>
            <div style={styles.headerTitle}>프로필</div>
            <div style={{ width: 18 }} />
            </div>
            <div style={styles.scrollArea}>
            <div style={styles.profileContainer}>
                <div style={styles.profileImage}>👩‍🍳</div>
                <div style={styles.profileNameRow}>
                <div style={styles.profileName}>{user.nickname || user.name}</div>
                <p>⭐ {user.avg_rating || user.rating} ({user.review_cnt || user.reviews}) 💚 {user.like_cnt || user.hearts}</p>
                </div>
                <div style={styles.profileDesc}>{user.disc || '진심을 담아 정성껏 만들겠습니다.'}</div>
                <div style={styles.buttonGroup}>
                <button style={styles.buttonYellow}>채팅하기</button>
                <button 
                  style={styles.buttonYellow}
                  onClick={addToFavorites}
                >
                  관심 판매자 등록하기
                </button>
                </div>
                <div style={styles.infoRow}>
                  {new Date(user.createdAt || new Date()).toLocaleDateString()} 회원 가입 · 
                  최근 로그인 {getTimeDiff(user.updatedAt || new Date())}
                </div>
            </div>
            <div style={styles.menuList}>
                <div style={styles.menuItem}><span onClick={goToSellerAuth} style={{cursor: 'pointer'}}><span style={styles.menuIcon}>🧾</span>판매자 인증한 사용자입니다.</span></div>
                <div style={styles.menuItem}><span onClick={goToSellerItem} style={{cursor: 'pointer'}}><span style={styles.menuIcon}>📃</span>판매 물품</span></div>
                <div style={styles.menuItem}><span onClick={goToRecipeList} style={{cursor: 'pointer'}}><span style={styles.menuIcon}>🍱</span>등록한 레시피</span></div>
                <div style={styles.menuItem}><span onClick={goToReviewList} style={{cursor: 'pointer'}}><span style={styles.menuIcon}>🍱</span>받은 평가</span></div>
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
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
    },
    error: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: 'red',
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
        textAlign: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        backgroundColor: '#fcd265',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        margin: '0 auto 10px',
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
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginBottom: 20,
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

export default OtherProfile;
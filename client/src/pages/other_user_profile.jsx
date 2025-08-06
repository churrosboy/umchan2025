import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';
import { ReactComponent as Star } from '../Icons/Star01.svg';
import { ReactComponent as Heart } from '../Icons/Heart01.svg';

const OtherProfile = () => {
    const { userId } = useParams();
    const user = sellers.find(u => u.id === Number(userId));
    const navigate = useNavigate();

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
                <div style={styles.profileName}>{user.name}</div>
                <p>
                    <Star width={13} height={13} style={{ verticalAlign: 'middle' }}/>
                    {user.rating} ({user.reviews})
                    <Heart width={15} height={15} style={{ verticalAlign: 'middle' }}/>
                    {user.hearts}</p>
                </div>
                <div style={styles.profileDesc}>진심을 담아 정성껏 만들겠습니다.</div>
                <div style={styles.buttonGroup}>
                <button style={styles.buttonYellow}>채팅하기</button>
                <button style={styles.buttonYellow}>관심 판매자 등록하기</button>
                </div>
                <div style={styles.infoRow}>2025.06.01 회원 가입 · 최근 로그인 3시간 전</div>
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
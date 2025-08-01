import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';  //seller 데이터

const OtherProfile = () => {
    const { userId } = useParams(); //이전 화면에서 선택된 seller의 Id 가져오는 부분
    const user = sellers.find(u => u.id === Number(userId));    //가져온 Id를 통해 sellers에서 정보를 찾아 user에 데이터 저장
    const navigate = useNavigate();

    if (!user) return <div>사용자를 찾을 수 없습니다.</div>;

    //판매자 위생인증 페이지 이동.Id 전달
    const goToSellerAuth = () => {
        navigate('/seller_auth/' + userId);
    };

    //판매자 판매물품 페이지로 이동.Id 전달(홈화면에서 판매자 선택 시 이동되는 화면과 동일)
    const goToSellerItem = () => {
        navigate('/seller_detail/' + userId);
    }

    //판매자가 등록한 레시피 리스트 페이지로 이동.Id 전달
    const goToRecipeList = () => {
        navigate('/user_recipe_list/' + userId);
    }

    //판매자에게 작성된 리뷰 리스트 페이지로 이동.Id 전달
    const goToReviewList = () => {
        navigate('/user_review_list/' + userId);
    }

    //뒤로가기 함수
    const goBack = () => {
        navigate(-1);
    };

    return (
        <div style={styles.wrapper}>
        <div style={styles.container}>
            {/*뒤로가기 버튼과 페이지 제목*/}
            <div style={styles.header}>
            <div style={styles.backButton}><span onClick={goBack}>←</span></div>
            <div style={styles.headerTitle}>프로필</div>
            <div style={{ width: 18 }} />
            </div>
            <div style={styles.scrollArea}>
            {/*프로필 정보 부분*/}
            <div style={styles.profileContainer}>
                {/*프로필 이미지란. 아직 이미지 불러오는거 구현X*/}
                <div style={styles.profileImage}>👩‍🍳</div>
                {/*닉네임과 평점, 관심 정보*/}
                <div style={styles.profileNameRow}>
                <div style={styles.profileName}>{user.name}</div>
                <p>⭐ {user.rating} ({user.reviews}) 💚 {user.hearts}</p>
                </div>
                {/*판매자의 한마디*/}
                <div style={styles.profileDesc}>진심을 담아 정성껏 만들겠습니다.</div>
                {/*판매자와 상호작용하는 버튼들*/}
                <div style={styles.buttonGroup}>
                <button style={styles.buttonYellow}>채팅하기</button>
                <button style={styles.buttonYellow}>관심 판매자 등록하기</button>
                </div>
                {/*회원가입 정보와 로그인 시간 부분인데 MVP에서는 구현하지 않기로 했던 것 같음*/}
                <div style={styles.infoRow}>2025.06.01 회원 가입 · 최근 로그인 3시간 전</div>
            </div>

            {/*위의 함수들을 통해 이동하는 부분들.*/}
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
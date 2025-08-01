import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';
import { reviews } from '../data/reviews';

const ReviewList = () => {
    const { userId } = useParams(); //userId 가져오는 부분
    const user = sellers.find(u => u.id === Number(userId));    //userId와 일치하는 데이터 저장
    const reviewList = reviews.filter(review => review.seller_id === Number(userId));   //판매자에게 작성된 리뷰들 저장
    const navigate = useNavigate();

    if (!user) return <div>사용자를 찾을 수 없습니다.</div>;
    
    //뒤로가기 함수
    const goBack = () => {
        navigate(-1);
    };

    return (
        <div style={styles.wrapper}>
        <div style={styles.container}>
            {/*헤더 - 뒤로가기 버튼, 제목(유저 닉네임)*/}
            <div style={styles.header}>
                <div style={styles.backButton} onClick={goBack}>←</div>
                <div style={styles.headerTitle}>{user.name}</div>
                <div style={{ width: 18 }} />
            </div>
            {/*소제목*/}
            <div style={styles.sectionTitleBar}>받은 리뷰</div>
            {/*내용*/}
            <div style={styles.scrollArea}>
                {/*리뷰 리스트 - 클릭 시 레시피 페이지로 이동, 나중에는 레시피에 달린 리뷰인지 판매물품에 달린 리뷰인지에 따라 차등 적용*/}
                {reviewList.map((review, idx) => (
                    <div style={styles.reviewCard} key={review.id} onClick={() => navigate(`/recipe/${review.id}`)}>
                        <div style={styles.reviewHeader}>
                            <div style={styles.reviewerName}>{review.buyer_name}</div>
                            <div style={styles.reviewRating}>{review.rating}</div>
                        </div>
                        <div style={styles.reviewContent}>
                            {review.desc}
                        </div>
                    </div>
                ))}
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
    sectionTitleBar: {
        padding: '10px 20px 6px',
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: '#f7f7f7',
    },
    scrollArea: {
        flex: 1,
        overflowY: 'auto',
        paddingBottom: 80,
    },
    reviewCard: {
        padding: '16px 20px',
        borderBottom: '1px solid #eee',
        fontSize: 14,
    },
    reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    reviewerName: {
        fontWeight: 'bold',
    },
    reviewRating: {
        fontSize: 13,
        color: '#f5a623',
    },
    reviewContent: {
        fontSize: 13,
        color: '#555',
        lineHeight: 1.5,
        whiteSpace: 'pre-line',
    },
};

export default ReviewList;
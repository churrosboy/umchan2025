import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reviews } from '../data/reviews';
import { users } from '../data/users';

const MyReview = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const user = users.find(u => u.id === Number(userId));
  const reviewList = reviews.filter(review => review.buyer_id === Number(userId));

  if (!user) return <div>사용자를 찾을 수 없습니다.</div>;

  const goBack = () => {
        navigate(-1);
    };
    

    return (
        <div style={styles.wrapper}>
        <div style={styles.container}>
            <div style={styles.header}>
            <div style={styles.backButton} onClick={goBack}>←</div>
            <div style={styles.headerTitle}>{user.nickname}</div>
            <div style={{ width: 18 }} />
            </div>
            <div style={styles.sectionTitleBar}>리뷰 관리</div>
            <div style={styles.scrollArea}>
            {reviewList.map((review, idx) => (
                <div style={styles.reviewCard} key={review.id} onClick={() => navigate(`/seller/${review.seller_id}`)}>
                <div style={styles.reviewHeader}>
                    <div style={styles.reviewerName}>{review.buyer_name}</div>
                    <div style={styles.reviewRating}>⭐ {review.rating}</div>
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

export default MyReview;
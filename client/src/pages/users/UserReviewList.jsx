import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../../data/sellers';
import { reviews } from '../../data/reviews';
import styles from './UserList.module.css';

const ReviewList = () => {
  const { userId } = useParams();
  const user = sellers.find(u => u.id === Number(userId));
  const reviewList = reviews.filter(review => review.seller_id === Number(userId));
  const navigate = useNavigate();

  if (!user) return <div>사용자를 찾을 수 없습니다.</div>;

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.backButton} onClick={goBack}>←</div>
          <div className={styles.headerTitle}>{user.name}</div>
          <div className={{ width: 18 }} />
        </div>
        <div className={styles.sectionTitleBar}>받은 리뷰</div>
        <div className={styles.scrollArea}>
          {reviewList.map((review, idx) => (
            <div className={styles.reviewCard} key={review.id} onClick={() => navigate(`/recipe/${review.id}`)}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerName}>{review.buyer_name}</div>
                <div className={styles.reviewRating}>{review.rating}</div>
              </div>
              <div className={styles.reviewContent}>
                {review.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewList;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiChevronRight,
  HiUser,
  HiPlusCircle,
  HiPencil,
  HiTicket,
  HiShoppingBag,
  HiBookOpen
} from 'react-icons/hi2';
import { users } from '../data/users';

const Profile = () => {
  const navigate = useNavigate();

  const userId = 10203;
  const user = users.find(u => u.id === userId);

  const goToSetting = () => {
    navigate('/setting/' + userId);
  };

  const goToRecipeRegister = () => {
    navigate('/RecipeRegister');
  }

  const goToSalesHistory = () => {
    navigate('/Sales_History');
  }

  const goToPurchaseHistory = () => {
    navigate('/Purchase_History');
  }

  const goToMyReview = () => {
    navigate('/MyReview/' + userId);
  }

  const goToMyRecipe = () => {
    navigate('/MyRecipe/' + userId);
  }
  
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* 프로필 카드 */}
        <div style={styles.profileCard} onClick={goToSetting}>
          <div style={styles.profileImageContainer}>
          {user.profile_img ? (
            <img
              src={user.profile_img}
              alt="프로필 사진"
              style={styles.profileImage}
            />
          ) : (
            <HiUser size={36} />
          )}
          </div>
          <div style={styles.profileInfo}>
            {user ? (
              <div style={styles.profileName}>{user.nickname}</div>
            ) : (
              <div style={styles.profileName}>사용자를 찾을 수 없습니다</div>
            )
            }
            <div style={styles.ratingBadge}>
              {user ? (
                <div style={styles.ratingText}>{user.avg_rating}공기</div>
              ) : (
                <div style={styles.ratingText}>error</div>
              )
              }
              
            </div>
          </div>
          <div style={styles.arrowIcon}>
            <HiChevronRight size={22}/>
          </div>
        </div>

        {/* 활동하기 카드 */}
        <div style={styles.activityCard}>
          <div style={styles.sectionTitle}>활동하기</div>
          <button style={styles.button}>
            <HiPlusCircle size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>내 음식 판매하기</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
          <button style={styles.button} onClick={goToRecipeRegister}>
            <HiPencil size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>레시피 공유하기</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
        </div>

        {/* 나의 거래 카드 */}
        <div style={styles.transactionCard}>
          <div style={styles.sectionTitle}>나의 거래</div>
          <button style={styles.button} onClick={goToSalesHistory}>
            <HiTicket size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>판매내역</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
          <button style={styles.button} onClick={goToPurchaseHistory}>
            <HiShoppingBag size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>구매내역</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
          <button style={styles.button} onClick={goToMyReview}>
            <HiBookOpen size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>리뷰 관리</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
          <button style={styles.button} onClick={goToMyRecipe}>
            <HiBookOpen size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>내 레시피</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
        </div>
        <div style={styles.margin}></div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'start',
    boxSizing: 'border-box',
    fontFamily: 'Roboto, sans-serif'
  },
  container: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  profileCard: {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    borderRadius: '15px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  profileImageContainer: {
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  profileInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
  },
  profileName: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'black'
  },
  ratingBadge: {
    backgroundColor: '#22BC03',
    borderRadius: '15px',
    padding: '4px 10px',
    alignSelf: 'center',
    textAlign: 'center',
  },
  ratingText: {
    fontSize: '12px',
    textAlign: 'center',
    color: '#CDFFB5'
  },
  arrowIcon: {
    backgroundColor: 'transparent',
    padding: '21.5px'
  },
  activityCard: {
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    borderRadius: '15px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  transactionCard: {
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    borderRadius: '15px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'black'
  },
  button: {
    backgroundColor: '#FFD856',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    borderRadius: '15px',
    position: 'relative',
    padding: '12px 40px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s ease',
  },
  leftIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '20px'
  },
  rightIcon: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '20px'
  },
  buttonText: {
    display: 'block'
  },
  margin: {
    padding: '20px'
  }
};

export default Profile;

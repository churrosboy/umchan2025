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

  const goToItemRegister = () => {
    navigate('/item_register');
  }

  const goToSalesHistory = () => {
    navigate('/Sales_History');
  }

  const goToPurchaseHistory = () => {
    navigate('/purchase_history');
  }

  const goToMyReview = () => {
    navigate('/my_review/' + userId);
  }

  const goToMyRecipe = () => {
    navigate('/my_recipe/' + userId);
  }
  
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* 프로필 카드 */}
        <button style={styles.profileCard} onClick={goToSetting}>
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
                <span style={styles.ratingText}>{user.avg_rating}공기</span>
              ) : (
                <span style={styles.ratingText}>error</span>
              )
              }
              
            </div>
          </div>
          <div style={styles.arrowIcon}>
            <HiChevronRight size={22} style={{ marginRight: 8 }}/>
          </div>
        </button>

        {/* 활동하기 카드 */}
        <div style={styles.activityCard}>
          <div style={styles.sectionTitle}>활동하기</div>
          <button style={styles.button}>
            <HiPlusCircle size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText} onClick={goToItemRegister}>내 음식 판매하기</span>
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
    padding: '40px 0',
    boxSizing: 'border-box',
    fontFamily: 'Roboto, sans-serif'
  },
  container: {
    width: '100%',
    maxWidth: '375px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  profileCard: {
    backgroundColor: '#D9D9D9',
    borderRadius: '15px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  profileImageContainer: {
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    backgroundColor: '#B4B3B3',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '15px'
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
    gap: '5px'
  },
  profileName: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'black'
  },
  ratingBadge: {
    backgroundColor: '#22BC03',
    borderRadius: '22px',
    padding: '4px 10px',
    alignSelf: 'center'
  },
  ratingText: {
    fontSize: '12px',
    textAlign: 'center',
    color: '#CDFFB5'
  },
  arrowIcon: {
    backgroundColor: 'transparent',
  },
  activityCard: {
    backgroundColor: '#D9D9D9',
    borderRadius: '15px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  transactionCard: {
    backgroundColor: '#D9D9D9',
    borderRadius: '15px',
    padding: '20px',
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
    borderRadius: '15px',
    position: 'relative',
    padding: '12px 40px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none'
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
    padding: '40px'
  }
};

export default Profile;

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
} from 'react-icons/hi2'; {/*아이콘들*/}
import { users } from '../data/users';  {/*임시 user data*/}

const Profile = () => {
  const navigate = useNavigate();

  const userId = 10203; //임시 userId, 기능 확인용으로 숫자 바꿔봐도 됨(data/users 의 id 참고).
  const user = users.find(u => u.id === userId);  //user = userId와 일치하는 유저의 데이터를 담아둠

  {/*세팅 화면으로 이동하는 함수, userId를 같이 넘겨줌 --> Apps.jsx 참고*/}
  const goToSetting = () => {
    navigate('/setting/' + userId);
  };

  {/*레시피 생성 화면으로 이동하는 함수, userId 넘겨주는 작업 필요*/}
  const goToRecipeRegister = () => {
    navigate('/RecipeRegister');
  }

  {/*판매 내역 페이지로 이동(아직 구현X)*/}
  const goToSalesHistory = () => {
    navigate('/Sales_History');
  }

  {/*구매 내역 페이지로 이동(아직 구현X)*/}
  const goToPurchaseHistory = () => {
    navigate('/Purchase_History');
  }

  {/*내가 작성한 리뷰 페이지로 이동, userId 넘겨줌*/}
  const goToMyReview = () => {
    navigate('/MyReview/' + userId);
  }

  {/*내 레시피 페이지로 이동, userId 넘겨줌*/}
  const goToMyRecipe = () => {
    navigate('/MyRecipe/' + userId);
  }
  
  return (
    <div style={styles.wrapper}>  {/*배경*/}
      <div style={styles.container}>  {/*요소들 담은 박스*/}

        {/* 프로필 카드 */}
        <button style={styles.profileCard} onClick={goToSetting}> {/*회색 구역 전체가 버튼임. 누르면 세팅화면으로 이동*/}
          {/*프로필 이미지 담은 컨테이너*/}
          <div style={styles.profileImageContainer}>
          {user.profile_img ? (
            <img
              src={user.profile_img}
              alt="프로필 사진"
              style={styles.profileImage}
            />
          ) : (
            <HiUser size={36} />
          )}  {/*프로필 이미지가 존재 --> 프로필 이미지 띄워줌, 존재X --> HiUser 아이콘 띄워줌*/}
          </div>
          {/*프로필 정보 나열*/}
          <div style={styles.profileInfo}>
            {user ? (
              <div style={styles.profileName}>{user.nickname}</div>
            ) : (
              <div style={styles.profileName}>사용자를 찾을 수 없습니다</div>
            )
            } {/*user 존재하면 닉네임 띄워줌*/}
            <div style={styles.ratingBadge}>
              {user ? (
                <span style={styles.ratingText}>{user.avg_rating}공기</span>
              ) : (
                <span style={styles.ratingText}>error</span>
              )
              } {/*user 존재하면 평점 띄워줌(avg_rating)*/}
              
            </div>
          </div>
          {/*프로필란 자체가 버튼임을 알게해주는 아이콘 삽입함*/}
          <div style={styles.arrowIcon}>
            <HiChevronRight size={22} style={{ marginRight: 8 }}/>
          </div>
        </button>

        {/* 활동하기 카드 */}
        <div style={styles.activityCard}>
          <div style={styles.sectionTitle}>활동하기</div> {/*제목*/}
          <button style={styles.button}>  {/*음식 판매 페이지로 이동하는 버튼. 음식 판매 페이지 아직 구현X*/}
            <HiPlusCircle size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>내 음식 판매하기</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
          <button style={styles.button} onClick={goToRecipeRegister}>  {/*레시피 공유 페이지로 이동하는 버튼, RecipeRegister로 이동하는 함수*/}
            <HiPencil size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>레시피 공유하기</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
        </div>

        {/* 나의 거래 카드 */}
        <div style={styles.transactionCard}>
          <div style={styles.sectionTitle}>나의 거래</div>  {/*제목*/}
          <button style={styles.button} onClick={goToSalesHistory}> {/*판매내역으로 이동하는 버튼, 아직 구현X*/}
            <HiTicket size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>판매내역</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
          <button style={styles.button} onClick={goToPurchaseHistory}>  {/*구매내역으로 이동하는 버튼, 아직 구현X*/}
            <HiShoppingBag size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>구매내역</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
          <button style={styles.button} onClick={goToMyReview}> {/*내가 작성한 리뷰들로 이동하는 버튼, 아직 구현X*/}
            <HiBookOpen size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>리뷰 관리</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
          <button style={styles.button} onClick={goToMyRecipe}> {/*내 레시피 페이지로 이동하는 버튼,my_recipe 페이지로 이동하는 함수, 페이지 수정 필요 */}
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

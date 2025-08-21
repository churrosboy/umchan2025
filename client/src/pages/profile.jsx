import React, { useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { users } from '../data/users'; 
import {
  HiChevronRight,
  HiUser,
  HiPlusCircle,
  HiPencil,
  HiTicket,
  HiShoppingBag,
  HiBookOpen
} from 'react-icons/hi2'; //아이콘들
import { getAuth } from 'firebase/auth';  //firebase auth 가져오기
import axios from 'axios'; //axios 가져오기

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5050';

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth(); //firebase auth 객체 가져오기
      const user = auth.currentUser; //현재 로그인된 사용자 정보 가져오기

      if (!user) {
        alert('로그인이 필요합니다.');
        navigate('/'); //로그인 페이지로 이동
        return null; //로그인 안되어있으면 아무것도 렌더링하지 않음
      }

      // Firebase 토큰 발급
      const token = await user.getIdToken();
      console.log(token)

      // API 요청 (토큰을 Authorization 헤더에 담음)
      const res = await axios.get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(res.data.user); //서버에서 받은 유저 데이터 저장
    };
    fetchProfile();
  }, [navigate]);

  if (!userData) {
    return <div>로딩 중...</div>; //유저 데이터가 없으면 로딩 중 메시지 표시
  }

  /*const { userId } = useParams();
  const user = users.find(u => u.id === Number(userId));
  */

  /*
  const userId = 10203; //임시 userId, 기능 확인용으로 숫자 바꿔봐도 됨(data/users 의 id 참고).
  const user = users.find(u => u.id === userId);  //user = userId와 일치하는 유저의 데이터를 담아둠
  */
  const userId = 10203; //임시 userId, 기능 확인용으로 숫자 바꿔봐도 됨(data/users 의 id 참고).
  {/*세팅 화면으로 이동하는 함수, userId를 같이 넘겨줌 --> Apps.jsx 참고*/}
  const goToSetting = () => {
    navigate('/setting');
  };

/*
  const goToMyRecipe = () => {
    navigate('/user_recipe_list/' + userId);
 */

  {/*레시피 생성 화면으로 이동하는 함수, userId 넘겨주는 작업 필요*/}
  const goToRecipeRegister = () => {
    navigate('/RecipeRegister');
  }

  {/*판매 내역 페이지로 이동(아직 구현X)*/}
  const goToSalesHistory = () => {
    navigate('/Sales_History');
  }

  const goToAuthReq = () => {
    navigate('/AuthReq');
  } //위생인증 요청 페이지로 이동하는 함수, AuthReq.jsx 참고

  {/*구매 내역 페이지로 이동(아직 구현X)*/}
  const goToPurchaseHistory = () => {
    navigate('/Purchase_History');
  }

  {/*내가 작성한 리뷰 페이지로 이동, userId 넘겨줌*/}
  const goToMyReview = () => {
    navigate('/My_review');
  }

  {/*내 레시피 페이지로 이동, userId 넘겨줌*/}
  const goToMyRecipe = () => {
    navigate('/MyRecipe/' + userId);
  }

  //테스트용 함수 (auth 상태 변경 함수)
  const toggleAuth = async () => {
    try {
      const auth = getAuth();
      const fbUser = auth.currentUser;
      if (!fbUser) {
        alert('로그인이 필요합니다.');
        return;
      }
      const token = await fbUser.getIdToken();
    
      const { data } = await axios.patch(
        `${API_BASE}/api/profile/toggle-auth`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
      const next = !!data?.user?.is_auth;
    
      // serverUser나 profile에 반영 (당신이 쓰는 쪽에 맞춰 하나만)
      setUserData((p) => ({ ...p, is_auth: next }));
      // setServerUser((u) => ({ ...u, is_auth: next }));  // serverUser를 쓰는 경우
    
      alert(`is_auth가 ${next ? 'true' : 'false'}로 변경되었습니다.`);
    } catch (e) {
      console.error(e);
      alert('토글 실패');
    }
  };

  //테스트용 함수 (auth 상태 변경 함수)
  
  return (
    <div style={styles.wrapper}>  {/*배경*/}
      <div style={styles.container}>  {/*요소들 담은 박스*/}

        {/* 프로필 카드 */}
        <div style={styles.profileCard} onClick={goToSetting}>  {/*프로필 구역 전체가 버튼임. 누르면 세팅화면으로 이동*/}
          {/*프로필 이미지 담은 컨테이너*/}

          <div style={styles.profileImageContainer}>
          {userData.profile_image ? (
            <img
              src={userData.profile_image}
              alt="프로필 사진"
              style={styles.profileImage}
            />
          ) : (
            <HiUser size={36} />
          )}  {/*프로필 이미지가 존재 --> 프로필 이미지 띄워줌, 존재X --> HiUser 아이콘 띄워줌*/}
          </div>
          {/*프로필 정보 나열*/}
          <div style={styles.profileInfo}>
            {userData ? (
              <div style={styles.profileName}>{userData.nickname}</div>
            ) : (
              <div style={styles.profileName}>사용자를 찾을 수 없습니다</div>
            )
            } {/*user 존재하면 닉네임 띄워줌*/}
            <div style={styles.ratingBadge}>
              {userData ? (
                <div style={styles.ratingText}>{userData.avg_rating}공기</div>
              ) : (
                <div style={styles.ratingText}>error</div>
              )
              } {/*user 존재하면 평점 띄워줌(avg_rating)*/}
              
            </div>
          </div>
          {/*프로필란 자체가 버튼임을 알게해주는 아이콘 삽입함*/}
          <div style={styles.arrowIcon}>
            <HiChevronRight size={22}/>
          </div>
        </div>

        {/* 활동하기 카드 */}
        <div style={styles.activityCard}>
          <div style={styles.sectionTitle}>활동하기</div> {/*제목*/}
            {userData.is_auth ? (
              <button style={styles.button}>
                <HiPlusCircle size={22} style={styles.leftIcon}/>
                <span style={styles.buttonText}>내 음식 판매하기</span>
                <HiChevronRight size={22} style={styles.rightIcon}/>
              </button>
            ) : (
              <button style={styles.button} onClick={goToAuthReq}>
                <HiPlusCircle size={22} style={styles.leftIcon}/>
                <span style={styles.buttonText}>음식 판매 인증 요청하기</span>
                <HiChevronRight size={22} style={styles.rightIcon}/>
              </button>
            )}

            {/*테스트용 버튼!! */}
            <button style={styles.button} onClick={toggleAuth}>
              <HiPlusCircle size={22} style={styles.leftIcon}/>
              <span style={styles.buttonText}>auth 상태 변경</span>
              <HiChevronRight size={22} style={styles.rightIcon}/>
            </button>
            {/*테스트용 버튼!! */}

          <button style={styles.button} onClick={goToRecipeRegister}>  {/*레시피 공유 페이지로 이동하는 버튼, RecipeRegister로 이동하는 함수*/}
            <HiPencil size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>레시피 공유하기</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
        </div>

        {/* 나의 거래 카드 */}
        <div style={styles.transactionCard}>
          <div style={styles.sectionTitle}>나의 거래</div>  {/*제목*/}
          { userData.is_auth ? (
          <button style={styles.button} onClick={goToSalesHistory}> {/*판매내역으로 이동하는 버튼, 아직 구현X*/}
            <HiTicket size={22} style={styles.leftIcon}/>
            <span style={styles.buttonText}>판매내역</span>
            <HiChevronRight size={22} style={styles.rightIcon}/>
          </button>
          ) : (
            <button style={styles.inactive_button}> {/*판매내역버튼 비활성화*/}
              <HiTicket size={22} style={styles.leftIcon}/>
              <span style={styles.buttonText}>판매내역</span>
              <HiChevronRight size={22} style={styles.rightIcon}/>
            </button>
          )}
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
  inactive_button: {
    backgroundColor: '#E1E1E1',
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

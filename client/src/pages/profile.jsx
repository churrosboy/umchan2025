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
import styles from '../styles/Profile.module.css';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

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

  const goToItemRegister = () => {
    navigate('/item_register');
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
    <div className={styles.wrapper}>
      <div className={styles.container}>

        {/* 프로필 카드 */}
        <div className={styles.profileCard} onClick={goToSetting}>
          <div className={styles.profileImageContainer}>
            {userData.profile_image ? (
              <img
                src={userData.profile_image}
                alt="프로필 사진"
                className={styles.profileImage}
              />
            ) : (
              <HiUser size={36} />
            )}
          </div>

          <div className={styles.profileInfo}>
            {userData ? (
              <div className={styles.profileName}>{userData.nickname}</div>
            ) : (
              <div className={styles.profileName}>사용자를 찾을 수 없습니다</div>
            )}

            <div className={styles.ratingBadge}>
              {userData ? (
                <div className={styles.ratingText}>{userData.avg_rating}공기</div>
              ) : (
                <div className={styles.ratingText}>error</div>
              )}
            </div>
          </div>

          <div className={styles.arrowIcon}>
            <HiChevronRight size={22} />
          </div>
        </div>

        {/* 활동하기 카드 */}
        <div className={styles.activityCard}>
          <div className={styles.sectionTitle}>활동하기</div>

          {userData.is_auth ? (
            <button className={styles.button} onClick={goToItemRegister}>
              <HiPlusCircle size={22} className={styles.leftIcon} />
              <span className={styles.buttonText}>내 음식 판매하기</span>
              <HiChevronRight size={22} className={styles.rightIcon} />
            </button>
          ) : (
            <button className={styles.button} onClick={goToAuthReq}>
              <HiPlusCircle size={22} className={styles.leftIcon} />
              <span className={styles.buttonText}>음식 판매 인증 요청하기</span>
              <HiChevronRight size={22} className={styles.rightIcon} />
            </button>
          )}

          {/* 테스트용 버튼 */}
          <button className={styles.button} onClick={toggleAuth}>
            <HiPlusCircle size={22} className={styles.leftIcon} />
            <span className={styles.buttonText}>auth 상태 변경</span>
            <HiChevronRight size={22} className={styles.rightIcon} />
          </button>

          <button className={styles.button} onClick={goToRecipeRegister}>
            <HiPencil size={22} className={styles.leftIcon} />
            <span className={styles.buttonText}>레시피 공유하기</span>
            <HiChevronRight size={22} className={styles.rightIcon} />
          </button>
        </div>

        {/* 나의 거래 카드 */}
        <div className={styles.transactionCard}>
          <div className={styles.sectionTitle}>나의 거래</div>

          {userData.is_auth ? (
            <button className={styles.button} onClick={goToSalesHistory}>
              <HiTicket size={22} className={styles.leftIcon} />
              <span className={styles.buttonText}>판매내역</span>
              <HiChevronRight size={22} className={styles.rightIcon} />
            </button>
          ) : (
            <button className={styles.inactive_button}>
              <HiTicket size={22} className={styles.leftIcon} />
              <span className={styles.buttonText}>판매내역</span>
              <HiChevronRight size={22} className={styles.rightIcon} />
            </button>
          )}

          <button className={styles.button} onClick={goToPurchaseHistory}>
            <HiShoppingBag size={22} className={styles.leftIcon} />
            <span className={styles.buttonText}>구매내역</span>
            <HiChevronRight size={22} className={styles.rightIcon} />
          </button>

          <button className={styles.button} onClick={goToMyReview}>
            <HiBookOpen size={22} className={styles.leftIcon} />
            <span className={styles.buttonText}>리뷰 관리</span>
            <HiChevronRight size={22} className={styles.rightIcon} />
          </button>

          <button className={styles.button} onClick={goToMyRecipe}>
            <HiBookOpen size={22} className={styles.leftIcon} />
            <span className={styles.buttonText}>내 레시피</span>
            <HiChevronRight size={22} className={styles.rightIcon} />
          </button>
        </div>

        <div className={styles.margin}></div>
      </div>
    </div>
  );
};

export default Profile;

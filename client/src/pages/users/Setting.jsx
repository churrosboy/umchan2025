import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { users } from '../../data/users';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import styles from './Setting.module.css';

const Setting = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const user = users.find(u => u.id === Number(userId));

  const goBack = () => {
    navigate(-1);
  }

  const goToUpdateProfile = () => {
    navigate('/UpdateProfile');
  }

  const goToAccountMng = () => {
    navigate('/AccountMng/' + userId);
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("로그아웃 실패: ", error);
      alert("로그아웃 중 문제가 발생했습니다.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.backButton}>
          <span onClick={goBack}>&lt; 뒤로가기</span>
        </div>

        <button className={styles.button} onClick={goToUpdateProfile}>프로필 수정</button>
        <button className={styles.button} onClick={goToAccountMng}>계정 관리</button>
        <button className={styles.button}>알림설정</button>
        <button className={styles.button}>채팅설정</button>
        <button className={styles.button}>앱 설정</button>

        <div className={styles.margin}></div>

        <button className={styles.button} onClick={handleLogout}>로그아웃</button>
        <button className={styles.button}>탈퇴하기</button>

        <div className={styles.margin}></div>
      </div>
    </div>
  );
};



export default Setting;

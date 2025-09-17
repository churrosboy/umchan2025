import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { commonStyles } from '../styles/commonStyles';

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  import.meta?.env?.VITE_API_BASE ||
  '';

const InitialProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 프로필 이미지 선택
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        alert('이미지 크기는 5MB 이하로 선택해주세요.');
        return;
      }
      setProfileImage(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  // 프로필 이미지 선택 버튼 클릭
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 닉네임 중복 체크
  const checkNicknameAvailability = async (nickname) => {
    try {
      const response = await fetch(`${API_BASE}/api/profile/check-nickname?nickname=${encodeURIComponent(nickname)}`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('닉네임 중복 체크 실패:', error);
      return false;
    }
  };

  // 프로필 이미지 업로드
  const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('uid', auth.currentUser.uid);

    try {
      const response = await fetch(`${API_BASE}/api/profile/upload-profile-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('이미지 업로드 실패');
      
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('프로필 이미지 업로드 실패:', error);
      throw error;
    }
  };

  // 완료하기
  const handleComplete = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    if (nickname.length < 2 || nickname.length > 10) {
      alert('닉네임은 2-10자 사이로 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 닉네임 중복 체크
      const isAvailable = await checkNicknameAvailability(nickname);
      if (!isAvailable) {
        alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.');
        setIsLoading(false);
        return;
      }

      let imageUrl = '';
      
      // 프로필 이미지가 있으면 업로드
      if (profileImage) {
        imageUrl = await uploadProfileImage(profileImage);
      }

      // 사용자 정보 업데이트 (Firebase 인증과 함께)
      const token = await auth.currentUser.getIdToken();
      
      const updateData = {
        uid: auth.currentUser.uid,
        nickname: nickname.trim(),
        introduction: introduction.trim(),
        profileImageUrl: imageUrl,
        isProfileComplete: true,
      };

      const response = await fetch(`${API_BASE}/api/profile/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '프로필 업데이트 실패');
      }

      // Firebase 사용자 프로필 업데이트
      await updateProfile(auth.currentUser, {
        displayName: nickname,
        photoURL: imageUrl || null,
      });

      alert('🎉 프로필 설정이 완료되었습니다!');
      navigate('/home', { replace: true });

    } catch (error) {
      console.error('프로필 설정 실패:', error);
      alert('프로필 설정 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 나중에 하기
  const handleSkipLater = async () => {
    if (!nickname.trim()) {
      alert('닉네임은 필수입니다. 닉네임을 입력해주세요.');
      return;
    }

    if (nickname.length < 2 || nickname.length > 10) {
      alert('닉네임은 2-10자 사이로 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 닉네임 중복 체크
      const isAvailable = await checkNicknameAvailability(nickname);
      if (!isAvailable) {
        alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.');
        setIsLoading(false);
        return;
      }

      // 닉네임만 업데이트 (Firebase 인증과 함께)
      const token = await auth.currentUser.getIdToken();
      
      const updateData = {
        uid: auth.currentUser.uid,
        nickname: nickname.trim(),
        isProfileComplete: false, // 나중에 완성할 예정
      };

      const response = await fetch(`${API_BASE}/api/profile/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '닉네임 업데이트 실패');
      }

      // Firebase 사용자 프로필 업데이트
      await updateProfile(auth.currentUser, {
        displayName: nickname,
      });

      navigate('/home', { replace: true });

    } catch (error) {
      console.error('닉네임 설정 실패:', error);
      alert('닉네임 설정 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>👋 프로필을 설정해주세요</h2>
        
        {/* 프로필 이미지 */}
        <div style={styles.profileImageContainer}>
          <div style={styles.profileImageWrapper} onClick={handleImageClick}>
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="프로필" style={styles.profileImage} />
            ) : (
              <div style={styles.profileImagePlaceholder}>
                <span style={styles.profileImageText}>📷</span>
                <span style={styles.profileImageSubText}>사진 선택</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={styles.hiddenInput}
          />
        </div>

        {/* 닉네임 */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>닉네임 *</label>
          <input
            style={styles.input}
            type="text"
            placeholder="다른 사용자들에게 보여질 닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={10}
          />
          <span style={styles.inputHint}>2-10자 사이로 입력해주세요</span>
        </div>

        {/* 한줄소개 */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>한줄소개</label>
          <textarea
            style={styles.textarea}
            placeholder="자신을 소개하는 한줄을 작성해주세요 (선택사항)"
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            maxLength={50}
            rows={2}
          />
          <span style={styles.inputHint}>{introduction.length}/50자</span>
        </div>

        {/* 버튼들 */}
        <div style={styles.buttonContainer}>
          <button 
            style={styles.primaryButton} 
            onClick={handleComplete}
            disabled={isLoading}
          >
            {isLoading ? '설정 중...' : '완료하기'}
          </button>
          
          <button 
            style={styles.secondaryButton} 
            onClick={handleSkipLater}
            disabled={isLoading}
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  ...commonStyles,
  profileImageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  profileImageWrapper: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '2px dashed #ccc',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'border-color 0.3s',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
  },
  profileImagePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#999',
  },
  profileImageText: {
    fontSize: '24px',
    marginBottom: '4px',
  },
  profileImageSubText: {
    fontSize: '12px',
  },
  hiddenInput: {
    display: 'none',
  },
  inputGroup: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  textarea: {
    ...commonStyles.input,
    resize: 'none',
    minHeight: '50px',
    paddingTop: '12px',
  },
  inputHint: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px',
    display: 'block',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '30px',
  },
  primaryButton: {
    ...commonStyles.button,
    backgroundColor: '#FFD856',
    color: 'white',
    fontWeight: 'bold',
  },
  secondaryButton: {
    ...commonStyles.button,
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    fontWeight: 'normal',
  },
};

export default InitialProfile;
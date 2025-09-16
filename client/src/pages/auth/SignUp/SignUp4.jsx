import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';
import { commonStyles } from '../../../styles/commonStyles';

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  import.meta?.env?.VITE_API_BASE ||
  ''; // 빈 문자열이면 동일 오리진

// ----- 주소 -> 좌표 변환 -----
const getCoordinatesFromAddress = async (address) => {
  if (!address || address.trim() === '') {
    throw new Error('주소가 비어있습니다.');
  }
  try {
    const res = await fetch(`${API_BASE}/api/geocode?address=${encodeURIComponent(address)}`);
    if (!res.ok) throw new Error(`서버 오류: ${res.status} ${res.statusText}`);
    const data = await res.json();
    if (data?.addresses?.length > 0) {
      const { x, y } = data.addresses[0]; // x: 경도, y: 위도
      return { longitude: parseFloat(x), latitude: parseFloat(y) };
    }
    throw new Error('주소 검색 결과가 없습니다. 주소를 확인해주세요.');
  } catch (err) {
    console.error('❌ 좌표 변환 실패:', err);
    throw err;
  }
};

// ----- Daum Postcode 스크립트 로더 -----
const ensureDaumPostcode = () =>
  new Promise((resolve, reject) => {
    if (window.daum?.Postcode) return resolve();
    const existing = document.querySelector('#daum-postcode-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Daum Postcode 로딩 실패')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'daum-postcode-script';
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Daum Postcode 로딩 실패'));
    document.body.appendChild(script);
  });

const Signup4 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 단계에서 받은 데이터
  const { email, password, phone, nickname } = location.state || {};

  // 상태
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // location.state 가 없으면 첫 단계로
  useEffect(() => {
    if (!email || !password) {
      alert('이메일/비밀번호 정보가 없습니다. 처음부터 진행해주세요.');
      navigate('/signup1', { replace: true });
    }
  }, [email, password, navigate]);

  // 주소 찾기
  const handleAddressSearch = useCallback(async () => {
    if (isLoading) return;
    try {
      await ensureDaumPostcode();
      // eslint-disable-next-line no-undef
      new window.daum.Postcode({
        oncomplete: (data) => {
          setPostcode(data.zonecode ?? '');
          setAddress(data.address ?? '');
          setTimeout(() => {
            const el = document.getElementById('detailAddress');
            if (el) el.focus();
          }, 0);
        },
      }).open();
    } catch (e) {
      console.error(e);
      alert('주소 검색 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }, [isLoading]);

  // 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 주소 체크
      if (!address) {
        throw new Error('주소를 입력해주세요.');
      }
      const fullAddress = `${address} ${detailAddress}`.trim();

      // 1) 지오코딩
      const { longitude, latitude } = await getCoordinatesFromAddress(fullAddress);

      // 2) Firebase 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 3) 백엔드 저장
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          nickname: nickname ?? '',
          phone_number: String(phone ?? ''),
          postcode,
          address: fullAddress,
          longitude,
          latitude,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || '서버에 사용자 정보를 저장하지 못했습니다.');
      }

      alert('🎉 회원가입이 완료되었습니다!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('회원가입 실패:', error);
      let msg = '회원가입 중 오류가 발생했습니다.';
      if (error.code === 'auth/email-already-in-use') msg = '이미 사용 중인 이메일입니다.';
      else if (String(error.message).includes('주소')) msg = error.message;
      else if (String(error.message).includes('서버')) msg = error.message;
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form style={styles.container} onSubmit={handleSubmit}>
        <h2 style={styles.title}>🏠 주소를 입력해주세요</h2>

        <div style={styles.addressContainer}>
          <input
            style={{ ...styles.input, flex: 1, marginBottom: 0 }}
            type="text"
            placeholder="우편번호"
            value={postcode}
            readOnly
          />
          <button
            type="button"
            style={styles.addressButton}
            onClick={handleAddressSearch}
            disabled={isLoading}
          >
            주소 찾기
          </button>
        </div>

        <input
          style={styles.input}
          type="text"
          placeholder="주소"
          value={address}
          readOnly
        />

        <input
          id="detailAddress"
          style={styles.input}
          type="text"
          placeholder="상세 주소"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
        />

        <button type="submit" style={styles.button} disabled={isLoading}>
          회원가입
        </button>
      </form>
    </div>
  );
};

// ----- 스타일 -----
const styles = {
  ...(commonStyles || {}), // commonStyles가 없으면 빈 객체
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9f9f9',
  },
  container: {
    width: '90%',
    maxWidth: '400px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    padding: '40px 30px',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '22px',
    marginBottom: '30px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  addressContainer: {
    display: 'flex',
    marginBottom: '15px',
    gap: '10px',
  },
  addressButton: {
    ...(commonStyles?.button || {}),
    width: 'auto',
    backgroundColor: '#e0e0e0',
    color: '#333',
    padding: '12px 15px',
    whiteSpace: 'nowrap',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
  },
  button: {
    ...(commonStyles?.button || {}),
    width: '100%',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    borderRadius: '10px',
  },
};

export default Signup4;
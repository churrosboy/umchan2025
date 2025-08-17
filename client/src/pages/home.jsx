import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Home.module.css';
import { ReactComponent as Star } from '../Icons/Star01.svg';
import { ReactComponent as Heart } from '../Icons/Heart01.svg';

const naverMapKey = process.env.REACT_APP_NAVER_CLIENT_ID;

const Home = () => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [panelHeight, setPanelHeight] = useState(window.innerHeight * 0.35);
  const [startY, setStartY] = useState(null);
  const [startHeight, setStartHeight] = useState(window.innerHeight * 0.35);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- 추가된 State ---
  const [map, setMap] = useState(null); // 지도 인스턴스를 저장할 state
  const [markers, setMarkers] = useState([]); // 현재 표시된 마커들을 저장할 state

  // 필터가 적용된 판매자 목록 (이 부분은 마커 생성 로직과 직접적인 관련이 없어졌습니다)
  const filtered = sellers.filter(s => filter === 'all' || s.sellingType === filter);
  
  // 서버로부터 판매자 데이터 가져오기
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await axios.get('/api/sellers');
        console.log("✅ 받아온 sellers:", res.data); 
        setSellers(res.data);
      } catch (err) {
        console.error('❌ 판매자 데이터 가져오기 실패:', err);
      }
    };
    fetchSellers();
  }, []);

  // 1. 지도 초기화 (최초 렌더링 시 한 번만 실행)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverMapKey}`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = new window.naver.maps.LatLng(latitude, longitude);
          
          const mapInstance = new window.naver.maps.Map(mapRef.current, {
            center: location,
            zoom: 15,
          });

          setMap(mapInstance); // 생성된 지도 인스턴스를 state에 저장

          window.naver.maps.Event.addListener(mapInstance, 'click', () => {
            setSelectedSeller(null);
            setPanelHeight(100);
          });
        },
        (error) => {
          console.error('❌ 현재 위치 가져오기 실패:', error);
          alert('현재 위치를 가져오는 데 실패했습니다. 위치 권한을 확인해주세요.');
        }
      );
    };
  }, []); // 의존성 배열 [] -> 최초 1회만 실행

  // 2. 마커 생성 및 뷰포트 관리 (지도와 판매자 데이터가 준비되면 실행)
  useEffect(() => {
    if (!map || sellers.length === 0) return;

    const updateMarkers = () => {
      const bounds = map.getBounds(); // 현재 지도 뷰포트 범위

      // 기존 마커들 삭제
      markers.forEach(marker => marker.setMap(null));
      const newMarkers = [];

      sellers.forEach((seller) => {
        if (!seller.lat || !seller.lng) return;

        const sellerPosition = new window.naver.maps.LatLng(seller.lat, seller.lng);

        // 판매자 위치가 현재 뷰포트 범위 안에 있을 때만 마커 생성
        if (bounds.hasLatLng(sellerPosition)) {
          const marker = new window.naver.maps.Marker({
            position: sellerPosition,
            map,
            title: seller.name,
          });

          window.naver.maps.Event.addListener(marker, 'click', () => {
            setSelectedSeller(seller);
            
            const newPanelHeight = 340; // 마커 클릭 시 설정될 패널 높이
            setPanelHeight(newPanelHeight);

            // 1. 마커의 지리 좌표를 화면 픽셀 좌표로 변환
            const projection = map.getProjection();
            const sellerPoint = projection.fromLatLngToPoint(sellerPosition);

            // 2. 패널 높이의 절반만큼 y 좌표를 아래로 이동시켜 새로운 중심 픽셀 좌표를 계산
            const newCenterPoint = new window.naver.maps.Point(
              sellerPoint.x,
              sellerPoint.y + newPanelHeight / 2
            );

            // 3. 계산된 새로운 중심 픽셀 좌표를 다시 지리 좌표로 변환
            const newCenterLatLng = projection.fromPointToLatLng(newCenterPoint);

            // 4. 보정된 새로운 중심으로 지도를 이동
            map.panTo(newCenterLatLng);
          });
          newMarkers.push(marker);
        }
      });
      setMarkers(newMarkers); // 새로 생성된 마커 목록을 state에 저장
    };
    
    updateMarkers(); // 최초 마커 업데이트

    // 지도 드래그/줌이 멈추면(idle) 마커 업데이트
    const idleListener = window.naver.maps.Event.addListener(map, 'idle', updateMarkers);

    // 컴포넌트 unmount 시 이벤트 리스너 제거 (메모리 누수 방지)
    return () => {
      window.naver.maps.Event.removeListener(idleListener);
    };

  }, [map, sellers]); // map 인스턴스나 sellers 데이터가 변경될 때마다 실행

  // 패널 높이에 따른 바디 스크롤 잠금/해제
  useEffect(() => {
    if (panelHeight > 100) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [panelHeight]);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setStartHeight(panelHeight);
  };

  const handleTouchMove = (e) => {
    if (startY === null) return;
    e.preventDefault();
    const deltaY = e.touches[0].clientY - startY;
    let newHeight = startHeight - deltaY;
    newHeight = Math.max(100, Math.min(window.innerHeight - 132, newHeight));
    setPanelHeight(newHeight);
  };

  const handleTouchEnd = () => {
    const maxHeight = window.innerHeight - 132;
    if (panelHeight > maxHeight * 0.85) {
      setPanelHeight(maxHeight);
    } else if (panelHeight < 150) {
      setPanelHeight(100);
    } else {
      setPanelHeight(panelHeight);
    }
    setStartY(null);
  };

  return (
    <div className={styles.wrapper}>
      <div ref={mapRef} className={styles.map} />
      <div className={styles.panel} style={{ height: panelHeight }}>
        <div
          className={styles.dragHandle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.dragBar} />
        </div>
        <div className={styles.panelContent}>
          {selectedSeller && (
            <button onClick={() => setSelectedSeller(null)} className={styles.backButton}>
              ←
            </button>
          )}
          {!selectedSeller ? (
            <>
              <div className={styles.filterButtons}>
                <button onClick={() => setFilter('immediate')} className={styles.filterButton}>즉시</button>
                <button onClick={() => setFilter('reservation')} className={styles.filterButton}>예약</button>
                <button onClick={() => setFilter('all')} className={styles.filterButton}>전체</button>
              </div>
              {filtered.map((seller) => (
                <div
                  key={seller.id}
                  className={styles.sellerItem}
                  onClick={() => navigate(`/seller_detail/${seller.id}`)}
                >
                  <div className={styles.sellerItemMain}>
                    <div className={styles.name}>{seller.name}</div>
                    <div className={styles.meta}>
                      <Star width={13} height={13} style={{ verticalAlign: 'middle' }}/>
                      {seller.rating} ({seller.reviews > 999 ? '999+' : seller.reviews})</div>
                    <div className={styles.meta}>
                      <Heart width={15} height={15} style={{ verticalAlign: 'middle' }}/>
                      {seller.hearts > 999 ? '999+' : seller.hearts}</div>
                  </div>
                  <div className={styles.address}>{seller.address}</div>
                  <div className={styles.thumbnailScroll}>
                    {seller.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={`/images${img}`}
                        alt={`썸네일${idx}`}
                        className={styles.thumbnailImage}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div>
              <h3 style={{ marginBottom: 5 }}>{selectedSeller.name}</h3>
              <p>
                <Star width={13} height={13} style={{ verticalAlign: 'middle' }}/>
                {selectedSeller.rating} ({selectedSeller.reviews})
                <Heart width={15} height={15} style={{ verticalAlign: 'middle' }}/>
                {selectedSeller.hearts}</p>
              <p style={{ fontSize: 14, color: '#666' }}>{selectedSeller.intro}</p>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
                {selectedSeller.address}
              </p>
              <div className={styles.thumbnailScroll}>
                {selectedSeller.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`/images${img}`}
                    alt={`판매자사진${idx}`}
                    className={styles.thumbnailImage}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
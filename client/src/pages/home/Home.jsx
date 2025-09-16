// home.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Home.module.css';
import { ReactComponent as Star } from '../../Icons/Star01.svg';
import { ReactComponent as Heart } from '../../Icons/Heart01.svg';

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
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  // 🆕 애니메이션과 터치 관련 상태 추가
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const panelRef = useRef(null);
  const lastTouchY = useRef(null);
  const touchVelocity = useRef(0);
  const lastTouchTime = useRef(null);

  // 패널 높이 useEffect를 위해 이전 높이를 저장할 ref
  const prevPanelHeight = useRef(window.innerHeight * 0.35);

  const filtered = sellers.filter(s => filter === 'all' || s.sellingType === filter);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await axios.get('/api/sellers');
        setSellers(res.data);
      } catch (err) {
        console.error('⌘ 판매자 데이터 가져오기 실패:', err);
      }
    };
    fetchSellers();
  }, []);

  // 지도 초기화
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

          setMap(mapInstance);

          window.naver.maps.Event.addListener(mapInstance, 'click', () => {
            setSelectedSeller(null);
            smoothSetPanelHeight(100);
          });
        },
        (error) => {
          console.error('⌘ 현재 위치 가져오기 실패:', error);
          alert('현재 위치를 가져오는 데 실패했습니다. 위치 권한을 확인해주세요.');
        }
      );
    };
  }, []);

  // 마커 생성 및 뷰포트 관리
  useEffect(() => {
    if (!map || sellers.length === 0) return;

    const updateMarkers = () => {
      const bounds = map.getBounds();
      markers.forEach(marker => marker.setMap(null));
      const newMarkers = [];

      sellers.forEach((seller) => {
        if (!seller.location || !seller.location.coordinates || seller.location.coordinates.length < 2) {
          return;
        }

        const lng = seller.location.coordinates[0];
        const lat = seller.location.coordinates[1];
        const sellerPosition = new window.naver.maps.LatLng(lat, lng);

        if (bounds.hasLatLng(sellerPosition)) {
          const marker = new window.naver.maps.Marker({
            position: sellerPosition,
            map,
            title: seller.nickname,
          });

          window.naver.maps.Event.addListener(marker, 'click', () => {
            setSelectedSeller(seller);
            const newPanelHeight = 340;
            smoothSetPanelHeight(newPanelHeight);

            const projection = map.getProjection();
            const sellerPoint = projection.fromLatLngToPoint(sellerPosition);

            const newCenterPoint = new window.naver.maps.Point(
              sellerPoint.x,
              sellerPoint.y + newPanelHeight / 2
            );

            const newCenterLatLng = projection.fromPointToLatLng(newCenterPoint);
            map.panTo(newCenterLatLng);
          });
          newMarkers.push(marker);
        }
      });
      setMarkers(newMarkers);
    };

    updateMarkers();
    const idleListener = window.naver.maps.Event.addListener(map, 'idle', updateMarkers);

    return () => {
      window.naver.maps.Event.removeListener(idleListener);
    };
  }, [map, sellers]);

  // 패널 높이 변경에 따른 지도 중심 이동
  useEffect(() => {
    if (!map || isDragging) return;
    const diff = panelHeight - prevPanelHeight.current;
    map.panBy(0, diff / 2);
    prevPanelHeight.current = panelHeight;
  }, [panelHeight, map, isDragging]);

  // 🆕 부드러운 패널 높이 설정 함수
  const smoothSetPanelHeight = (targetHeight) => {
    setIsTransitioning(true);
    setPanelHeight(targetHeight);

    // 애니메이션이 끝난 후 transition 상태 해제
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  // 🆕 개선된 터치 시작 핸들러
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setStartHeight(panelHeight);
    setIsDragging(true);
    setIsTransitioning(false);
    lastTouchY.current = touch.clientY;
    lastTouchTime.current = Date.now();
    touchVelocity.current = 0;
  };

  // 🆕 개선된 터치 이동 핸들러
  const handleTouchMove = (e) => {
    if (startY === null || !isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const currentY = touch.clientY;
    const currentTime = Date.now();

    // 속도 계산 (관성 효과를 위해)
    if (lastTouchTime.current && currentTime - lastTouchTime.current > 0) {
      touchVelocity.current = (currentY - lastTouchY.current) / (currentTime - lastTouchTime.current);
    }

    const deltaY = currentY - startY;
    let newHeight = startHeight - deltaY;

    // 경계값 처리 (탄성 효과 추가)
    const minHeight = 100;
    const maxHeight = window.innerHeight - 132;

    if (newHeight < minHeight) {
      // 최소 높이보다 작을 때 저항감 추가
      newHeight = minHeight - (minHeight - newHeight) * 0.3;
    } else if (newHeight > maxHeight) {
      // 최대 높이보다 클 때 저항감 추가
      newHeight = maxHeight + (newHeight - maxHeight) * 0.3;
    }

    setPanelHeight(newHeight);
    lastTouchY.current = currentY;
    lastTouchTime.current = currentTime;
  };

  // 🆕 개선된 터치 종료 핸들러
  const handleTouchEnd = () => {
    if (startY === null || !isDragging) return;

    const maxHeight = window.innerHeight - 132;
    const minHeight = 100;
    let targetHeight = panelHeight;

    // 관성 효과 적용
    const velocityThreshold = 0.5;
    if (Math.abs(touchVelocity.current) > velocityThreshold) {
      const inertiaDistance = touchVelocity.current * 200; // 관성 거리
      targetHeight = panelHeight - inertiaDistance;
    }

    // 스냅 포인트 설정
    const midHeight = maxHeight * 0.5;
    const highThreshold = maxHeight * 0.85;
    const lowThreshold = 150;

    if (targetHeight > highThreshold) {
      targetHeight = maxHeight;
    } else if (targetHeight < lowThreshold) {
      targetHeight = minHeight;
    } else if (targetHeight > midHeight) {
      targetHeight = maxHeight;
    } else {
      targetHeight = minHeight;
    }

    // 경계값 보정
    targetHeight = Math.max(minHeight, Math.min(maxHeight, targetHeight));

    setIsDragging(false);
    smoothSetPanelHeight(targetHeight);
    setStartY(null);

    // 리셋
    lastTouchY.current = null;
    lastTouchTime.current = null;
    touchVelocity.current = 0;
  };

  // 🆕 마우스 이벤트도 지원 (데스크톱에서 테스트용)
  const handleMouseDown = (e) => {
    e.preventDefault();
    setStartY(e.clientY);
    setStartHeight(panelHeight);
    setIsDragging(true);
    setIsTransitioning(false);
    lastTouchY.current = e.clientY;
    lastTouchTime.current = Date.now();

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const currentY = e.clientY;
      const currentTime = Date.now();

      if (lastTouchTime.current && currentTime - lastTouchTime.current > 0) {
        touchVelocity.current = (currentY - lastTouchY.current) / (currentTime - lastTouchTime.current);
      }

      const deltaY = currentY - startY;
      let newHeight = startHeight - deltaY;

      const minHeight = 100;
      const maxHeight = window.innerHeight - 132;

      if (newHeight < minHeight) {
        newHeight = minHeight - (minHeight - newHeight) * 0.3;
      } else if (newHeight > maxHeight) {
        newHeight = maxHeight + (newHeight - maxHeight) * 0.3;
      }

      setPanelHeight(newHeight);
      lastTouchY.current = currentY;
      lastTouchTime.current = currentTime;
    };

    const handleMouseUp = () => {
      handleTouchEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={styles.wrapper}>
      <div ref={mapRef} className={styles.map} />
      <div
        ref={panelRef}
        className={`${styles.panel} ${isDragging ? styles.dragging : ''} ${isTransitioning ? styles.transitioning : ''}`}
        style={{
          height: panelHeight,
          transition: isDragging ? 'none' : isTransitioning ? 'height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none'
        }}
      >
        <div
          className={styles.dragHandle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none' // 브라우저 기본 터치 동작 방지
          }}
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
                  key={seller.id || seller._id}
                  className={styles.sellerItem}
                  onClick={() => navigate(`/seller_detail/${seller.id || seller._id}`)}
                >
                  <div className={styles.sellerItemMain}>
                    <div className={styles.name}>{seller.nickname}</div>
                    <div className={styles.meta}>
                      <Star width={13} height={13} style={{ verticalAlign: 'middle' }} />
                      {seller.avg_rating} ({seller.review_cnt > 999 ? '999+' : seller.review_cnt})
                    </div>
                    <div className={styles.meta}>
                      <Heart width={15} height={15} style={{ verticalAlign: 'middle' }} />
                      {seller.like_cnt > 999 ? '999+' : seller.like_cnt}
                    </div>
                  </div>
                  <div className={styles.address}>{seller.address}</div>
                  <div className={styles.thumbnailScroll}>
                    {seller.thumbnail_list && seller.thumbnail_list.map((img, idx) => (
                      <img
                        key={idx}
                        src={`/images$seller1-1`}
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
              <h3 style={{ marginBottom: 5 }}>{selectedSeller.nickname}</h3>
              <p>
                <Star width={13} height={13} style={{ verticalAlign: 'middle' }} />
                {selectedSeller.avg_rating} ({selectedSeller.review_cnt})
                <Heart width={15} height={15} style={{ verticalAlign: 'middle' }} />
                {selectedSeller.like_cnt}
              </p>
              <p style={{ fontSize: 14, color: '#666' }}>{selectedSeller.intro}</p>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
                {selectedSeller.address}
              </p>
              <div className={styles.thumbnailScroll}>
                {selectedSeller.thumbnail_list && selectedSeller.thumbnail_list.map((img, idx) => (
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
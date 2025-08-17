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
  
  // --- 패널 높이 관련 State ---
  const [panelHeight, setPanelHeight] = useState(window.innerHeight * 0.35);
  const [startY, setStartY] = useState(null);
  const [startHeight, setStartHeight] = useState(window.innerHeight * 0.35);
  // 이전 패널 높이를 추적하기 위한 ref 추가
  const prevPanelHeight = useRef(window.innerHeight * 0.35);

  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

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
        console.error('❌ 판매자 데이터 가져오기 실패:', err);
      }
    };
    fetchSellers();
  }, []);

  // 1. 지도 초기화
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
            setPanelHeight(100);
          });
        },
        (error) => {
          console.error('❌ 현재 위치 가져오기 실패:', error);
          alert('현재 위치를 가져오는 데 실패했습니다. 위치 권한을 확인해주세요.');
        }
      );
    };
  }, []);

  // 2. 마커 생성 및 뷰포트 관리
  useEffect(() => {
    if (!map || sellers.length === 0) return;

    const updateMarkers = () => {
      const bounds = map.getBounds();
      markers.forEach(marker => marker.setMap(null));
      const newMarkers = [];

      sellers.forEach((seller) => {
        if (!seller.lat || !seller.lng) return;
        const sellerPosition = new window.naver.maps.LatLng(seller.lat, seller.lng);

        if (bounds.hasLatLng(sellerPosition)) {
          const marker = new window.naver.maps.Marker({
            position: sellerPosition,
            map,
            title: seller.name,
          });

          window.naver.maps.Event.addListener(marker, 'click', () => {
            setSelectedSeller(seller);
            const newPanelHeight = 340;
            setPanelHeight(newPanelHeight);

            const projection = map.getProjection();
            const sellerPoint = projection.fromLatLngToPoint(sellerPosition);
            
            // 패널 높이의 절반만큼 y 좌표를 위로 이동시켜 새로운 중심 픽셀 좌표를 계산
            // (화면 좌표계는 위가 0, 아래가 + 이므로, 위로 올리려면 y값을 빼야 합니다)
            const newCenterPoint = new window.naver.maps.Point(
              sellerPoint.x,
              sellerPoint.y - newPanelHeight / 2 
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
  
  // 3. 패널 높이 변경에 따른 지도 중심 이동
  useEffect(() => {
    if (!map) return;
    const diff = panelHeight - prevPanelHeight.current;
    map.panBy(new window.naver.maps.Point(0, diff / 1.5));

    prevPanelHeight.current = panelHeight;

  }, [panelHeight, map]);


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
    if (startY === null) return; // 이미 끝났으면 중복 실행 방지
    const currentY = panelHeight;
    const maxHeight = window.innerHeight - 132;
    
    let finalHeight = currentY;

    if (panelHeight > maxHeight * 0.85) {
      finalHeight = maxHeight;
    } else if (panelHeight < 150) {
      finalHeight = 100;
    }
    
    setPanelHeight(finalHeight);
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
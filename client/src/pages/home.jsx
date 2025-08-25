// home.jsx
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
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  // 💡 패널 높이 useEffect를 위해 이전 높이를 저장할 ref
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

  // 2. 마커 생성 및 뷰포트 관리 (데이터 구조 최종 수정 버전)
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
            setPanelHeight(newPanelHeight);

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

  // 💡 3. 패널 높이 변경에 따른 지도 중심 이동 (충돌 가능성 있는 부분)
  useEffect(() => {
    if (!map) return;
    const diff = panelHeight - prevPanelHeight.current;
    // panBy는 화면 픽셀 기준이므로 Point 객체를 사용하지 않아도 됩니다.
    map.panBy(0, diff / 2); // 패널이 움직인 만큼의 절반만 지도를 이동
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
    if (startY === null) return;
    const maxHeight = window.innerHeight - 132;
    
    if (panelHeight > maxHeight * 0.85) {
      setPanelHeight(maxHeight);
    } else if (panelHeight < 150) {
      setPanelHeight(100);
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
                  key={seller.id || seller._id}
                  className={styles.sellerItem}
                  onClick={() => navigate(`/seller_detail/${seller.id || seller._id}`)}
                >
                  <div className={styles.sellerItemMain}>
                    <div className={styles.name}>{seller.nickname}</div>
                    <div className={styles.meta}>
                      <Star width={13} height={13} style={{ verticalAlign: 'middle' }}/>
                      {seller.avg_rating} ({seller.review_cnt > 999 ? '999+' : seller.review_cnt})
                    </div>
                    <div className={styles.meta}>
                      <Heart width={15} height={15} style={{ verticalAlign: 'middle' }}/>
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
                <Star width={13} height={13} style={{ verticalAlign: 'middle' }}/>
                {selectedSeller.avg_rating} ({selectedSeller.review_cnt})
                <Heart width={15} height={15} style={{ verticalAlign: 'middle' }}/>
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
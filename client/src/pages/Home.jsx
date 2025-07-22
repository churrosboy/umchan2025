import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';
import styles from '../styles/Home.module.css';

const Home = () => {
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const [filter, setFilter] = useState('all');
  const [panelHeight, setPanelHeight] = useState(100);
  const [startY, setStartY] = useState(null);
  const [startHeight, setStartHeight] = useState(100);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const filtered = sellers.filter(s => filter === 'all' || s.sellingType === filter);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=kfa8a20u6r';
    script.async = true;
    script.onload = () => {
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 15,
      });

      filtered.forEach((seller) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(seller.lat, seller.lng),
          map,
          title: seller.name,
        });

        window.naver.maps.Event.addListener(marker, 'click', () => {
          setSelectedSeller(seller);
          setPanelHeight(340);
        });
      });
    };
    document.head.appendChild(script);
  }, [filter]);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setStartHeight(panelHeight);
  };

  const handleTouchMove = (e) => {
    if (startY === null) return;
    e.preventDefault();
    const deltaY = e.touches[0].clientY - startY;
    let newHeight = startHeight - deltaY;
    newHeight = Math.max(100, Math.min(400, newHeight));
    setPanelHeight(newHeight);
  };

  const handleTouchEnd = () => {
    if (panelHeight < 200) setPanelHeight(100);
    else setPanelHeight(340);
    setStartY(null);
  };

  return (
    <div className={styles.wrapper}>
      <div ref={mapRef} className={styles.map} />

      {/* 슬라이드 패널 */}
      <div
        className={styles.panel}
        style={{ height: panelHeight }}
      >
        <div
          className={styles.dragHandle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.dragBar} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
          {/* 공통 가로 스크롤 이미지 섹션 */}
          <div style={{ display: 'flex', overflowX: 'auto', gap: 8, marginBottom: 10 }}>
            {filtered.flatMap(seller => seller.images.slice(0, 1)).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`썸네일${idx}`}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 8,
                  flexShrink: 0
                }}
              />
            ))}
          </div>

          {!selectedSeller ? (
            <>
              <div className={styles.filterButtons}>
                <button onClick={() => setFilter('immediate')}>즉시</button>
                <button onClick={() => setFilter('reservation')}>예약</button>
                <button onClick={() => setFilter('all')}>전체</button>
              </div>
              {filtered.map((seller) => (
                <div
                  key={seller.id}
                  className={styles.sellerItem}
                  onClick={() => navigate(`/seller/${seller.id}`)}
                >
                  <strong>{seller.name}</strong>
                  <p>⭐ {seller.rating} ({seller.reviews}) 💚 {seller.hearts}</p>
                  <p>{seller.address}</p>
                </div>
              ))}
            </>
          ) : (
            <div>
              <h3 style={{ marginBottom: 5 }}>{selectedSeller.name}</h3>
              <p>⭐ {selectedSeller.rating} ({selectedSeller.reviews}) 💚 {selectedSeller.hearts}</p>
              <p style={{ fontSize: 14, color: '#666' }}>{selectedSeller.intro}</p>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>{selectedSeller.address}</p>

              {/* 선택된 판매자의 상세 이미지들 */}
              <div style={{ display: 'flex', overflowX: 'auto', gap: 8 }}>
                {selectedSeller.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`판매자사진${idx}`}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 8,
                      flexShrink: 0
                    }}
                  />
                ))}
              </div>

              <div style={{ marginTop: 10, textAlign: 'right' }}>
                <button onClick={() => setSelectedSeller(null)}>← 리스트로 돌아가기</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
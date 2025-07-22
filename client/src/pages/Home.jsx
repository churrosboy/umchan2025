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

  const filtered = sellers.filter(s => filter === 'all' || s.sellingType === filter);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=kfa8a20u6r';
    script.async = true;
    script.onload = () => {
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 15,
      });

      filtered.forEach((seller) => {
        new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(seller.lat, seller.lng),
          map,
          title: seller.name,
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
    const deltaY = e.touches[0].clientY - startY;
    let newHeight = startHeight - deltaY;
    if (newHeight < 100) newHeight = 100;
    if (newHeight > 400) newHeight = 400;
    setPanelHeight(newHeight);
  };

  const handleTouchEnd = () => {
    setPanelHeight(panelHeight < 200 ? 100 : 340);
    setStartY(null);
  };

  return (
    <div className={styles.wrapper}>
      <div ref={mapRef} className={styles.map} />

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
          <div className={styles.filterButtons}>
            <button onClick={() => setFilter('immediate')}>즉시</button>
            <button onClick={() => setFilter('reservation')}>예약</button>
            <button onClick={() => setFilter('all')}>전체</button>
          </div>

          {filtered.map((seller) => (
            <div
              key={seller.id}
              onClick={() => navigate(`/seller/${seller.id}`)}
              className={styles.sellerItem}
            >
              <strong>{seller.name}</strong>
              <p>⭐ {seller.rating} ({seller.reviews}) ❤️ {seller.hearts}</p>
              <p>{seller.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

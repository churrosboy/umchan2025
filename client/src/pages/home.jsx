import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';
import styles from '../styles/Home.module.css';
import { ReactComponent as Star } from '../Icons/Star01.svg';
import { ReactComponent as Heart } from '../Icons/Heart01.svg';

const Home = () => {
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const [filter, setFilter] = useState('all');
  const [panelHeight, setPanelHeight] = useState(window.innerHeight * 0.35);
  const [startY, setStartY] = useState(null);
  const [startHeight, setStartHeight] = useState(window.innerHeight * 0.35);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const filtered = sellers.filter(s => filter === 'all' || s.sellingType === filter);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=';
    script.async = true;
    script.onload = () => {
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 15,
      });

      window.naver.maps.Event.addListener(map, 'click', () => {
        setSelectedSeller(null);
        setPanelHeight(100);
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

        <div className={styles.panelContent}>
          {selectedSeller && (
            <button onClick={() => setSelectedSeller(null)} className={styles.backButton}>←</button>
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
                        src={img}
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
              <p style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>{selectedSeller.address}</p>
              <div className={styles.thumbnailScroll}>
                {selectedSeller.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
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

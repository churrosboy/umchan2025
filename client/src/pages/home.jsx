import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Home.module.css';
import { ReactComponent as Star } from '../Icons/Star01.svg';
import { ReactComponent as Heart } from '../Icons/Heart01.svg';

const naverMapKey = process.env.REACT_APP_NAVER_CLIENT_ID;

const Home = () => {
  const mapRef = useRef(null);  // 지도를 그릴 화면 참조
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');  //즉시/예약/전체 상태를 선택하기 위한 필터
  const [panelHeight, setPanelHeight] = useState(window.innerHeight * 0.35);  //판매자 패널의 높이
  const [startY, setStartY] = useState(null); //터치스크롤 시작 위치 저장
  const [startHeight, setStartHeight] = useState(window.innerHeight * 0.35);  //터치스크롤 높이 저장
  const [selectedSeller, setSelectedSeller] = useState(null); //현재 선택된 판매자
  const [sellers, setSellers] = useState([]);


  //즉시/예약/전체 필터가 적용된 판매자의 목록
  const filtered = sellers.filter(s => filter === 'all' || s.sellingType === filter);
  
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

  //최초 렌더 시 네이버 지도 스크립트 로드 및 마커 생성
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverMapKey}`;
    script.async = true;
    script.onload = () => {
      //지도 생성
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 15,
      });

      //지도 클릭 시 선택 해제 및 패널 닫기
      window.naver.maps.Event.addListener(map, 'click', () => {
        setSelectedSeller(null);
        setPanelHeight(100);
      });

      //각 판매자 위치에 마커 표시, 클릭 이벤트
      filtered.forEach((seller) => {
        if (!seller.lat || !seller.lng) return;

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
  }, [filtered]);

  //패널 높이에 따라 바디 스크롤 잠금/해제
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

  // 터치 드래그 시작: 시작 Y위치와 높이 저장
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setStartHeight(panelHeight);
  };

  //터치 이동 중: 높이 재계산
  const handleTouchMove = (e) => {
    if (startY === null) return;
    e.preventDefault();
    const deltaY = e.touches[0].clientY - startY;
    let newHeight = startHeight - deltaY;
    newHeight = Math.max(100, Math.min(window.innerHeight - 132, newHeight));
    setPanelHeight(newHeight);
  };

  // 터치 끝: 최종 위치에 따라 패널 위치 조정(검색란에 스크롤 부분이 가려지면 맨 위로 패널 이동)
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
      {/*지도 영역*/}
      <div ref={mapRef} className={styles.map} />

      {/*높이 조절이 가능한 하단 패널*/}
      <div
        className={styles.panel}
        style={{ height: panelHeight }}
      >
        {/*드래그 관련 코드(터치 시작, 터치중, 터치 끝)*/}
        <div
          className={styles.dragHandle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.dragBar} />
        </div>

        {/*판매자 정보 등 패널 내용들*/}
        <div className={styles.panelContent}>
          {/*지도 마커 클릭 시 나온 판매자에서 뒤로가기 버튼*/}
          {selectedSeller && (
            <button onClick={() => setSelectedSeller(null)} className={styles.backButton}>
              ←
            </button>
          )}
          {/*지도 마커 클릭 안했으면 -> 필터에 따른 판매자 리스트, 마커 클릭하면 -> 클릭한 장소 판매자 리스트 표시*/}
          {!selectedSeller ? (
            <>
              <div className={styles.filterButtons}>
                <button onClick={() => setFilter('immediate')} className={styles.filterButton}>즉시</button>
                <button onClick={() => setFilter('reservation')} className={styles.filterButton}>예약</button>
                <button onClick={() => setFilter('all')} className={styles.filterButton}>전체</button>
              </div>
              {/*판매 유형에 따른 판매자 리스트*/}
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
            /* 지도 마커에서 선택된 판매자 상세보기 */
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

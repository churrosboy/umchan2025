export const sellers = [
  {
    id: 1,
    name: '김여사 반찬가게',
    lat: 37.5665,
    lng: 126.9780,
    rating: 5.0,
    reviews: 192,
    hearts: 23,
    sellingType: 'immediate', // 또는 'reservation'
    address: '수원 장안구 율전동 123-4',
    menus: [
      { id: 101, name: '메뉴A', price: 15000, desc: '소불고기 반찬', reviews: 9 },
      { id: 102, name: '메뉴B', price: 12000, desc: '오이무침', reviews: 5 },
    ],
    images: [
      '/images/seller1-1.jpeg',
      '/images/seller1-2.jpeg',
      '/images/seller1-3.jpeg'
    ],

  },
  {
    id: 2,
    name: '최여사 집반찬',
    lat: 37.565,
    lng: 126.977,
    rating: 4.8,
    reviews: 99,
    hearts: 12,
    sellingType: 'reservation',
    address: '서울 성북구 하월곡동 222-1',
    menus: [
      { id: 103, name: '메뉴C', price: 13000, desc: '김치전', reviews: 12 },
    ],
    images: [
      '/images/seller2-1.jpeg',
      '/images/seller2-2.jpeg',
      '/images/seller2-3.jpeg'
    ],
  },
];
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
      process.env.PUBLIC_URL + '/images/seller1-1.jpeg',
      process.env.PUBLIC_URL + '/images/seller1-2.jpeg',
      process.env.PUBLIC_URL + '/images/seller1-3.jpeg'
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
      process.env.PUBLIC_URL + '/images/seller2-1.jpeg',
      process.env.PUBLIC_URL + '/images/seller2-2.jpeg',
      process.env.PUBLIC_URL + '/images/seller2-3.jpeg'
    ],
  },
  {
  id: 3,
  name: '해당 가게는 한국에서 가장 긴 도로명 주소를 가지고 있는 가게입니다',
  lat: 37.565,
  lng: 126.976,
  rating: 4.9,
  reviews: 10000,
  hearts: 12,
  sellingType: 'reservation',
  address: '부산광역시 강서구 녹산산단382로14번가길 10~29번지',
  menus: [
    { id: 102, name: '메뉴B', price: 12000, desc: '오이무침', reviews: 5 },
    { id: 103, name: '메뉴C', price: 13000, desc: '김치전', reviews: 12 },
  ],
  images: [
    '/images/seller1-1.jpeg',
    '/images/seller2-1.jpeg',
    '/images/seller1-2.jpeg',
    '/images/seller2-2.jpeg',
    '/images/seller1-3.jpeg',
    '/images/seller2-3.jpeg',
  ],
},
];
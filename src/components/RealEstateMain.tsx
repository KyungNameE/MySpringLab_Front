import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './RealEstateMain.css';
import backgroundImage1 from '../assets/albedo_close.ebp.webp';
import backgroundImage2 from '../assets/1.jpg';

// ✅ 추천 매물 데이터 타입 정의
interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  images: string[];
}

const RealEstateMain: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]); // 🏡 추천 매물 상태
  const [searchQuery, setSearchQuery] = useState<string>(''); // 🔍 검색어 상태
  const [lastSearch, setLastSearch] = useState<string>(''); // 🔍 마지막 검색어 저장
  const isFirstSearch = useRef<boolean>(true); // ✅ 첫 번째 검색 여부 확인
  const searchInputRef = useRef<HTMLInputElement>(null); // 🔎 검색 입력창 포커싱
  const listingsRef = useRef<HTMLDivElement>(null); // 🔽 검색 후 스크롤 이동을 위한 Ref

  // ✅ 페이지 최초 로드시 전체 추천 매물 조회
  useEffect(() => {
    fetchAllProperties();
    focusSearchInput(); // 🔎 페이지 로드 시 검색 입력창으로 포커싱
  }, []);

  // 🔄 전체 추천 매물 조회 함수 (최초 로드 + 검색어가 비어 있을 때)
  const fetchAllProperties = () => {
    axios.get('http://localhost:8080/api/homes')
      .then((response) => {
        setProperties(response.data);
        setLastSearch(''); // 검색어 초기화
      })
      .catch((error) => {
        console.error('추천 매물 데이터를 불러오는 중 오류 발생:', error);
      });
  };

  // 🔍 검색 실행 함수 (검색 조건에 따라 필터링)
  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      fetchAllProperties();
      scrollToListings(); // 🔽 빈 검색어도 추천 매물 포커싱
      return;
    }

    setLastSearch(searchQuery); // 마지막 검색어 저장
    axios.get(`http://localhost:8080/api/homes/search?title=${encodeURIComponent(searchQuery)}`)
      .then((response) => {
        setProperties(response.data);
        scrollToListings(); // 🔽 검색 후 추천 매물 섹션으로 포커싱 ⭕
      })
      .catch((error) => {
        console.error('검색 중 오류 발생:', error);
      });

    isFirstSearch.current = false; // ✅ 첫 검색 이후 상태 변경
  };

  // 🔽 추천 매물 섹션으로 스크롤 이동
  const scrollToListings = () => {
    if (listingsRef.current) {
      listingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 🔎 검색 입력창에 자동 포커싱 (페이지 새로고침 시)
  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // 🔍 엔터 입력 시 검색 실행
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="realestate-container">
      {/* 기본 배경 */}
      <div className="background-image" style={{ backgroundImage: `url(${backgroundImage1})` }}></div>

      {/* 메인 섹션 */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Find Your Perfect Property</h1>
          <p className="hero-subtitle">
            Discover modern living spaces with premium amenities.
          </p>
          <div className="search-bar">
            <input
              ref={searchInputRef} // 🔎 검색 입력창에 자동 포커싱
              type="text"
              placeholder="Enter property name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown} // 🔍 엔터 입력 처리
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>
      </section>

      {/* 추가 배경 (스크롤 시 나타남) */}
      <div className="background-section" style={{ backgroundImage: `url(${backgroundImage2})` }}>

        {/* 추천 매물 (스와이퍼 적용) */}
        <section className="listings" ref={listingsRef}>
          <h2 className="section-title">Perfect Property</h2>
          {properties.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              breakpoints={{
                768: { slidesPerView: 2 }, // 태블릿 이상: 2개씩 보이기
                1024: { slidesPerView: 3 }, // 데스크탑: 3개씩 보이기
              }}
              className="listing-swiper"
            >
              {properties.map((property) => (
                <SwiperSlide key={property.id}>
                  <div className="card">
                    {/* ✅ 이미지 URL을 백엔드에서 제공하는 경로로 변환 */}
                    <img
                      src={`http://localhost:8080/files/${encodeURIComponent(property.images[0])}`}
                      alt={property.title}
                      style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                    />
                    <div className="card-info">
                      <h3>{property.title}</h3>
                      <p>Price: ₩{property.price.toLocaleString()}</p>
                      <p>Location: {property.location}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="no-results">
              "{lastSearch || '전체'}" 검색된 매물이 없습니다.
            </p>
          )}
        </section>
      </div>

      {/* 푸터 */}
      <footer className="footer">
        <p>&copy; 2025 My Real Estate. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RealEstateMain;

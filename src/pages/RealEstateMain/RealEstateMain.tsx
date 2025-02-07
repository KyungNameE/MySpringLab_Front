import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./RealEstateMain.css";

import Header from "../../components/Header/Header.tsx";
import backgroundVideo from "../../assets/백그라운드7.mp4";

// 공통 유틸에서 행정구역 코드 관련 함수 및 인터페이스 import
import {
  fetchSdCodes,
  fetchSggCodes,
  fetchEmdCodes,
  SdCode,
  SggCode,
  EmdCode,
} from "../../utils/codeUtil.ts";

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  mainImage: string;
}

const RealEstateMain: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lastSearch, setLastSearch] = useState<string>("");

  // 행정구역 코드 관련 상태값
  const [sdCodes, setSdCodes] = useState<SdCode[]>([]);
  const [sggCodes, setSggCodes] = useState<SggCode[]>([]);
  const [emdCodes, setEmdCodes] = useState<EmdCode[]>([]);

  // 선택된 콤보박스 값 (상위 선택 시 하위 값 초기화)
  const [selectedSd, setSelectedSd] = useState<string>("");
  const [selectedSgg, setSelectedSgg] = useState<string>("");
  const [selectedEmd, setSelectedEmd] = useState<string>("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const listingsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllProperties();
    focusSearchInput();

    // 행정구역 코드 목록 가져오기
    fetchSdCodes().then((data) => setSdCodes(data));
    fetchSggCodes().then((data) => setSggCodes(data));
    fetchEmdCodes().then((data) => setEmdCodes(data));
  }, []);

  // 전체 매물 가져오기
  const fetchAllProperties = () => {
    axios
      .get("http://localhost:8080/api/homes")
      .then((response) => {
        setProperties(response.data);
        setLastSearch("");
      })
      .catch((error) => {
        console.error("추천 매물 데이터를 불러오는 중 오류 발생:", error);
      });
  };

  // 검색 API 호출 시 선택한 행정구역 코드도 함께 쿼리스트링에 포함
  const handleSearch = () => {
    if (searchQuery.trim() === "" && !selectedSd && !selectedSgg && !selectedEmd) {
      fetchAllProperties();
      scrollToListings();
      return;
    }
    setLastSearch(searchQuery);

    // 기본적으로 타이틀 검색 조건
    let query = `?title=${encodeURIComponent(searchQuery)}`;

    // 선택된 행정구역 조건 추가
    if (selectedSd) {
      query += `&sdCd=${encodeURIComponent(selectedSd)}`;
    }
    if (selectedSgg) {
      query += `&sggCd=${encodeURIComponent(selectedSgg)}`;
    }
    if (selectedEmd) {
      query += `&emdCd=${encodeURIComponent(selectedEmd)}`;
    }

    axios
      .get(`http://localhost:8080/api/homes${query}`)
      .then((response) => {
        setProperties(response.data);
        scrollToListings();
      })
      .catch((error) => {
        console.error("검색 중 오류 발생:", error);
      });
  };

  const scrollToListings = () => {
    if (listingsRef.current) {
      listingsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="realestate-container">
      {/* 공통 헤더 */}
      <Header />

      {/* 배경 동영상 */}
      <div className="video-background">
        <video src={backgroundVideo} autoPlay muted loop playsInline />
      </div>

      {/* Hero 섹션 */}
      <section className="hero" id="home">
        <div className="hero-content">
          <h1 className="hero-title">Find Your Perfect Property</h1>
          <p className="hero-subtitle">
            Discover modern living spaces with premium amenities.
          </p>

          {/* 행정구역 콤보박스 (검색조건) */}
          <div className="search-comboboxes">
            {/* 시도 선택 */}
            <select
              value={selectedSd}
              onChange={(e) => {
                setSelectedSd(e.target.value);
                // 시도 선택 시 하위 값 초기화
                setSelectedSgg("");
                setSelectedEmd("");
              }}
            >
              <option value="">시도 선택</option>
              {sdCodes.map((code) => (
                <option key={code.sdCd} value={code.sdCd}>
                  {code.sdNm}
                </option>
              ))}
            </select>

            {/* 시군구 선택 (시도가 선택되어야 활성화) */}
            <select
              value={selectedSgg}
              onChange={(e) => {
                setSelectedSgg(e.target.value);
                setSelectedEmd("");
              }}
              disabled={!selectedSd}
            >
              <option value="">시군구 선택</option>
              {sggCodes
                .filter((code) => code.sdCd === selectedSd)
                .map((code) => (
                  <option key={code.sggCd} value={code.sggCd}>
                    {code.sggNm}
                  </option>
                ))}
            </select>

            {/* 읍면동 선택 (시군구가 선택되어야 활성화) */}
            <select
              value={selectedEmd}
              onChange={(e) => setSelectedEmd(e.target.value)}
              disabled={!selectedSgg}
            >
              <option value="">읍면동 선택</option>
              {emdCodes
                .filter((code) => code.sggCd === selectedSgg)
                .map((code) => (
                  <option key={code.emdCd} value={code.emdCd}>
                    {code.emdNm}
                  </option>
                ))}
            </select>
          </div>

          {/* 검색바 */}
          <div className="search-bar">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Enter property name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>
      </section>

      {/* Listings 섹션 */}
      <section className="listings" id="listings" ref={listingsRef}>
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
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            className="listing-swiper"
          >
            {properties.map((property) => (
              <SwiperSlide key={property.id}>
                <div
                  className="card"
                  onClick={() => navigate(`/property/${property.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={`http://localhost:8080/files/${encodeURIComponent(
                      property.mainImage || "sample.jpg"
                    )}`}
                    alt={property.title}
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
            "{lastSearch || "전체"}" 검색 결과가 없습니다.
          </p>
        )}
      </section>

      {/* Contact 섹션 */}
      <section className="contact-section" id="contact">
        <h2 className="section-title">Contact Us</h2>
        {/* 추가 내용... */}
      </section>

      <footer className="footer">
        <p>&copy; 2025 My Real Estate. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RealEstateMain;

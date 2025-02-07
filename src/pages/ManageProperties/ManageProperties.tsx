import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header/Header.tsx";
import "./ManageProperties.css";
import detailBackground from "../../assets/detail_background.jpg";


// 행정구역 코드 관련 유틸 및 인터페이스 import
import {
  fetchSdCodes,
  fetchSggCodes,
  fetchEmdCodes,
  SdCode,
  SggCode,
  EmdCode,
} from "../../utils/codeUtil.ts";

interface HomeVO {
  id?: number;
  title: string;
  price: number;
  description: string;
  location: string;
  mainImage?: string;
  images?: string[];
}

const ManageProperties: React.FC = () => {
  const [propertyList, setPropertyList] = useState<HomeVO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // 검색 상태 (제목)
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 행정구역 코드 상태
  const [sdCodes, setSdCodes] = useState<SdCode[]>([]);
  const [sggCodes, setSggCodes] = useState<SggCode[]>([]);
  const [emdCodes, setEmdCodes] = useState<EmdCode[]>([]);

  // 선택된 행정구역 값
  const [selectedSd, setSelectedSd] = useState<string>("");
  const [selectedSgg, setSelectedSgg] = useState<string>("");
  const [selectedEmd, setSelectedEmd] = useState<string>("");

  // 모달 열림/닫힘 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 등록 폼 필드
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("0");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  // 대표 이미지 (파일 + 미리보기)
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  // 추가 이미지 (파일[] + 미리보기[])
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  // 목록 페이지에서 전달된 state (상세 페이지의 "목록" 버튼 클릭 시 전달됨)
  const locationState = useLocation().state as {
    searchQuery?: string;
    propertyList?: HomeVO[];
  } | null;

  useEffect(() => {
    // 전달된 state가 있다면 그대로 사용
    if (locationState && locationState.searchQuery && locationState.propertyList) {
      setSearchQuery(locationState.searchQuery);
      setPropertyList(locationState.propertyList);
      setLoading(false);
    } else {
      fetchProperties();
    }
    focusSearchInput();

    // 행정구역 코드 목록 가져오기
    fetchSdCodes().then((data) => setSdCodes(data));
    fetchSggCodes().then((data) => setSggCodes(data));
    fetchEmdCodes().then((data) => setEmdCodes(data));
  }, [locationState]);

  // 전체 매물 목록 조회
  const fetchProperties = () => {
    setLoading(true);
    axios
      .get("http://localhost:8080/api/homes")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setPropertyList(response.data);
        } else {
          setError("서버 응답이 배열이 아닙니다.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("목록 조회 중 오류 발생");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 검색 수행 (제목 및 행정구역 조건 포함)
  const handleSearch = () => {
    // 조건이 없으면 전체 조회
    if (
      searchQuery.trim() === "" &&
      selectedSd === "" &&
      selectedSgg === "" &&
      selectedEmd === ""
    ) {
      fetchProperties();
      return;
    }
    setLoading(true);
    // 기본 제목 검색 조건
    let query = `?title=${encodeURIComponent(searchQuery)}`;
    // 행정구역 조건 추가
    if (selectedSd) query += `&sdCd=${encodeURIComponent(selectedSd)}`;
    if (selectedSgg) query += `&sggCd=${encodeURIComponent(selectedSgg)}`;
    if (selectedEmd) query += `&emdCd=${encodeURIComponent(selectedEmd)}`;

    axios
      .get(`http://localhost:8080/api/homes${query}`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setPropertyList(response.data);
        } else {
          setError("서버 응답이 배열이 아닙니다.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("검색 중 오류 발생");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 모달 열기
  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기 및 폼 초기화
  const closeModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setPrice("0");
    setDescription("");
    setLocation("");
    setMainImage(null);
    setMainImagePreview(null);
    setImages([]);
    setImagesPreview([]);
  };

  // 대표 이미지 업로드 (미리보기)
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setMainImage(file);
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);
    }
  };

  // 추가 이미지 업로드 (미리보기)
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages([...images, ...newFiles]);
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      setImagesPreview([...imagesPreview, ...newPreviews]);
    }
  };

  // 매물 등록
  const handleCreate = () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("location", location);

    if (mainImage) {
      formData.append("mainImage", mainImage);
    }
    images.forEach((file) => {
      formData.append("images", file);
    });

    axios
      .post("http://localhost:8080/api/homes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        alert("매물이 등록되었습니다.");
        fetchProperties();
        closeModal();
      })
      .catch((err) => {
        console.error(err);
        alert("등록 중 오류 발생");
      });
  };

  if (loading && propertyList.length === 0) {
    return <div className="manage-container">로딩 중...</div>;
  }
  if (error) {
    return <div className="manage-container error">{error}</div>;
  }

  return (
    <div className="manage-detail-container">
      <Header />
      <div
        className="detail-background"
        style={{ backgroundImage: `url(${detailBackground})` }}
      ></div>
      <div className="manage-box">
        <div className="manage-box-header">
          <h2>매물 목록 관리</h2>
          <button className="open-modal-btn" onClick={openModal}>
            매물 등록
          </button>
        </div>
        {/* 행정구역 콤보박스 영역 */}
        <div className="search-comboboxes">
          {/* 시도 선택 */}
          <select
            value={selectedSd}
            onChange={(e) => {
              setSelectedSd(e.target.value);
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
          {/* 시군구 선택 (시도 선택 후 활성화) */}
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
          {/* 읍면동 선택 (시군구 선택 후 활성화) */}
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
        {/* 검색 바 (제목 입력 및 검색 버튼) */}
        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="매물 제목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch}>검색</button>
        </div>
        {/* 매물 목록 표시 */}
        <div
          className="table-container"
          style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.5s ease" }}
        >
          {propertyList.length === 0 ? (
            <p>등록된 매물이 없습니다.</p>
          ) : (
            <table className="manage-table">
              <thead>
              <tr>
                <th>ID</th>
                <th>제목</th>
                <th>가격</th>
                <th>위치</th>
                <th>대표이미지</th>
              </tr>
              </thead>
              <tbody>
              {propertyList.map((home) => (
                <tr
                  key={home.id}
                  onClick={() => {
                    if (home.id) {
                      // 상세 페이지로 이동 시 현재 검색 상태와 결과를 함께 전달
                      navigate(`/property/${home.id}`, {
                        state: { searchQuery, propertyList },
                      });
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td>{home.id}</td>
                  <td>{home.title}</td>
                  <td>{home.price?.toLocaleString()}</td>
                  <td>{home.location}</td>
                  <td>
                    {home.mainImage ? (
                      <img
                        src={`http://localhost:8080/files/${home.mainImage}`}
                        alt="대표이미지"
                        className="table-image"
                      />
                    ) : (
                      "없음"
                    )}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          )}
        </div>
        {/* 등록 모달 */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
              <h3>매물 등록</h3>
              <div className="modal-form">
                <div className="form-group">
                  <label>제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>가격</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>위치</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>설명</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>대표 이미지</label>
                  <input type="file" onChange={handleMainImageChange} />
                  {mainImagePreview && (
                    <img
                      src={mainImagePreview}
                      alt="대표미리보기"
                      className="preview-image"
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>추가 이미지</label>
                  <input type="file" multiple onChange={handleImagesChange} />
                  {imagesPreview.length > 0 && (
                    <div className="images-preview-container">
                      {imagesPreview.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`미리보기-${i}`}
                          className="preview-image"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button className="create-btn" onClick={handleCreate}>
                  등록
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProperties;

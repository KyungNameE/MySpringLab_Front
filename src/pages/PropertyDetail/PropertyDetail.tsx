import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./PropertyDetail.css";

import Header from "../../components/Header/Header";
import detailBackground from "../../assets/detail_background.jpg";

/** 매물 정보 인터페이스 */
interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  description: string;
  mainImage: string;
  images: string[];
}

interface LocationState {
  searchQuery?: string;
  propertyList?: Property[];
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const locationState = useLocation().state as LocationState | undefined;

  // 매물 정보 상태
  const [property, setProperty] = useState<Property | null>(null);

  // 모달 (이미지 확대)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 수정 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    description: "",
  });

  // 대표 이미지 업로드 + 미리보기
  const [selectedMainImage, setSelectedMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  // 추가 이미지 업로드 + 미리보기
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:8080/api/homes/${id}`)
        .then((resp) => {
          const fetched = resp.data;
          setProperty(fetched);
          // 수정 폼 초기값
          setFormData({
            title: fetched.title,
            price: fetched.price,
            location: fetched.location,
            description: fetched.description,
          });
        })
        .catch((err) =>
          console.error("매물 정보를 불러오는 중 오류 발생:", err)
        );
    }
  }, [id]);

  // 목록 이동 시, 이전 검색 상태(state)를 그대로 전달
  const handleGoList = () => {
    navigate("/manage", { state: locationState });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedMainImage(file);
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedImages([...selectedImages, ...newFiles]);
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      setImagesPreview([...imagesPreview, ...newPreviews]);
    }
  };

  const handleUpdate = () => {
    if (!id) return;
    const updateData = new FormData();
    updateData.append("title", formData.title);
    updateData.append("price", formData.price);
    updateData.append("location", formData.location);
    updateData.append("description", formData.description);

    if (selectedMainImage) {
      updateData.append("mainImage", selectedMainImage);
    }
    selectedImages.forEach((file) => {
      updateData.append("images", file);
    });

    axios
      .put(`http://localhost:8080/api/homes/${id}`, updateData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        alert("매물 정보가 수정되었습니다.");
        setProperty(response.data);
        setSelectedMainImage(null);
        setMainImagePreview(null);
        setSelectedImages([]);
        setImagesPreview([]);
      })
      .catch((error) =>
        console.error("매물 정보 수정 중 오류 발생:", error)
      );
  };

  const handleDeleteImage = (imageUrl: string) => {
    if (!id) return;
    axios
      .delete(`http://localhost:8080/api/homes/${id}/images?imageUrl=${encodeURIComponent(imageUrl)}`)
      .then(() => {
        alert("이미지가 삭제되었습니다.");
        setProperty((prev) =>
          prev ? { ...prev, images: prev.images.filter((img) => img !== imageUrl) } : null
        );
      })
      .catch((error) =>
        console.error("이미지 삭제 중 오류 발생:", error)
      );
  };

  const handleSetMainImageAPI = (imageUrl: string) => {
    if (!id) return;
    axios
      .put(`http://localhost:8080/api/homes/${id}/images/main?imageUrl=${encodeURIComponent(imageUrl)}`)
      .then(() => {
        alert("대표 이미지가 변경되었습니다.");
        axios
          .get(`http://localhost:8080/api/homes/${id}`)
          .then((resp) => setProperty(resp.data))
          .catch((err) => console.error(err));
      })
      .catch((error) =>
        console.error("대표 이미지 설정 중 오류 발생:", error)
      );
  };

  const handleDeleteProperty = () => {
    if (!id) return;
    if (window.confirm("삭제하시겠습니까?")) {
      axios
        .delete(`http://localhost:8080/api/homes/${id}`)
        .then(() => {
          alert("삭제되었습니다.");
          navigate("/manage", { state: locationState });
        })
        .catch((error) =>
          console.error("삭제 중 오류 발생:", error)
        );
    }
  };

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  if (!property) return <p>로딩 중...</p>;

  const allImages = [
    `http://localhost:8080/files/${property.mainImage || "sample.jpg"}`,
    ...(property.images || []).map((img) => `http://localhost:8080/files/${img}`),
  ];

  return (
    <div className="property-detail-container">
      <Header />
      <div
        className="detail-background"
        style={{ backgroundImage: `url(${detailBackground})` }}
      ></div>
      <div className="property-detail">
        <div className="detail-header">
          <button className="back-btn" onClick={handleGoList}>목록</button>
          <h2>매물 상세 정보</h2>
          <button className="delete-property-btn" onClick={handleDeleteProperty}>매물 삭제</button>
        </div>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={15}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="property-swiper"
        >
          {allImages.map((imageUrl, idx) => (
            <SwiperSlide key={idx}>
              <div className="image-container">
                <img
                  src={imageUrl}
                  alt={`이미지 ${idx + 1}`}
                  onClick={() => openModal(idx)}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <button className="close-btn" onClick={closeModal}>×</button>
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                className="modal-swiper"
                initialSlide={selectedImageIndex}
              >
                {allImages.map((url, i2) => (
                  <SwiperSlide key={i2}>
                    <img src={url} alt={`확대 이미지 ${i2 + 1}`} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}
        <div className="property-form">
          <label>제목</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
          <label>가격</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
          />
          <label>위치</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
          <label>설명</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
          <label>대표 이미지 변경</label>
          <input type="file" onChange={handleMainImageChange} />
          {mainImagePreview && (
            <img
              src={mainImagePreview}
              alt="대표이미지 미리보기"
              style={{ width: "100px", height: "80px", objectFit: "cover", marginTop: "5px" }}
            />
          )}
          <label>추가 이미지 업로드</label>
          <input type="file" multiple onChange={handleImageChange} />
          {imagesPreview.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "5px" }}>
              {imagesPreview.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`미리보기-${i}`}
                  style={{ width: "100px", height: "80px", objectFit: "cover" }}
                />
              ))}
            </div>
          )}
          <button onClick={handleUpdate}>수정 완료</button>
        </div>
        <div className="image-list">
          <h3>이미지 목록</h3>
          <div className="main-image-section">
            <strong>대표 이미지</strong>
            <div className="image-wrapper">
              <img
                src={`http://localhost:8080/files/${property.mainImage || "sample.jpg"}`}
                alt="대표 이미지"
              />
            </div>
          </div>
          <div className="additional-images-section">
            <strong>추가 이미지</strong>
            {property.images && property.images.length > 0 ? (
              <div className="additional-images-grid">
                {property.images.map((imgUrl, index) => (
                  <div key={index} className="additional-image-item">
                    <img
                      src={`http://localhost:8080/files/${imgUrl}`}
                      alt={`추가 이미지 ${index + 1}`}
                    />
                    <div className="additional-image-buttons">
                      <button onClick={() => handleSetMainImageAPI(imgUrl)}>
                        대표 이미지 설정
                      </button>
                      <button onClick={() => handleDeleteImage(imgUrl)}>
                        이미지 삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ marginTop: "10px" }}>추가 이미지가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ImagePreviewModal.css";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialSlide?: number;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
                                                               isOpen,
                                                               onClose,
                                                               images,
                                                               initialSlide = 0,
                                                             }) => {
  if (!isOpen) return null;

  return (
    <div className="image-preview-modal">
      <div className="image-preview-modal-content">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          className="modal-swiper"
          initialSlide={initialSlide}
        >
          {images.map((url, index) => (
            <SwiperSlide key={index}>
              <img src={url} alt={`확대 이미지 ${index + 1}`} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ImagePreviewModal;

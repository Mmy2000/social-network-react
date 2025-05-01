import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ImageModal = ({ isOpen, onClose, images }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target.id === "image-modal-backdrop") {
      onClose();
    }
  };

  return (
    <div
      id="image-modal-backdrop"
      className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative max-w-4xl w-full rounded-md shadow-xl dark:bg-gray-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute  right-4 text-gray-700 dark:text-gray-300 hover:text-red-500 transition text-3xl z-50"
          aria-label="Close image viewer"
        >
          &times;
        </button>

        {/* Swiper Gallery */}
        <Swiper
          navigation
          pagination={{ clickable: true }}
          modules={[Navigation, Pagination]}
          className="w-full h-[500px] rounded-md"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                src={image.image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ImageModal;
